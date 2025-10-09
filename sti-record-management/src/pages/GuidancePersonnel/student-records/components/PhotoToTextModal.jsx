import React, { useState } from 'react';
import axios from 'axios';

import { X, Check } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SectionTabs = ({ tabs, active, onChange }) => (
    <div className="flex gap-2 mb-4">
        {tabs.map(t => (
            <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={`px-3 py-1 rounded ${active === t.key ? 'bg-[#0172bd] text-white' : 'bg-gray-100'}`}
            >
                {t.label}
            </button>
        ))}
    </div>
);

const NestedInput = ({ value, onChange, placeholder }) => (
    <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border px-2 py-1 rounded" />
);

const emptyTemplate = () => ({
    sid: '',
    isArchived: false,
    studentProfile: {
        name: '',
        nickname: '',
        section: '',
        academicLevel: '',
        age: '',
        nationality: 'Filipino',
        gender: '',
        status: '',
        birthPlace: '',
        birthday: '',
        religion: '',
        program: ''
    },
    contactInfo: {
        email: '',
        contactNo: '',
        homeNo: '',
        workNo: '',
        address: {
            currentAddress: '',
            permanentAddress: '',
            provincialAddress: ''
        }
    },
    familyBackground: {
        fatherInfo: { name: '' },
        motherInfo: { name: '' },
        guardian: { name: '' },
        emergency: { name: '', contactNo: '' },
    },
});

const PhotoToTextModal = ({ visible, onClose, onOCRSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [ocrData, setOcrData] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    if (!visible) return null;

    // Validate required fields (based on your Joi schema)
    const validateRequired = (data) => {
        const missing = [];
        if (!data) {
            // nothing scanned yet
            return { valid: false, missing: ['scan-image'] };
        }
        const sid = (data.sid || '').toString().trim();
        const sp = data.studentProfile || {};
        const ci = data.contactInfo || {};
        const addr = ci.address || {};

        if (!sid) missing.push('sid');
        if (!sp.name || !sp.name.toString().trim()) missing.push('studentProfile.name');
        if (!sp.section || !sp.section.toString().trim()) missing.push('studentProfile.section');
        if (!sp.academicLevel || !sp.academicLevel.toString().trim()) missing.push('studentProfile.academicLevel');
        // age must be a number in schema — leave client to enter number
        if (!sp.age && sp.age !== 0) missing.push('studentProfile.age');
        if (!sp.program || !sp.program.toString().trim()) missing.push('studentProfile.program');
        if (!sp.birthday || !sp.birthday.toString().trim()) missing.push('studentProfile.birthday');
        if (!sp.gender || !sp.gender.toString().trim()) missing.push('studentProfile.gender');

        if (!ci.email || !ci.email.toString().trim()) missing.push('contactInfo.email');
        if (!ci.contactNo || !ci.contactNo.toString().trim()) missing.push('contactInfo.contactNo');

        // contactInfo.address.currentAddress is required per your schema
        if (!addr.currentAddress || !addr.currentAddress.toString().trim()) missing.push('contactInfo.address.currentAddress');

        return { valid: missing.length === 0, missing };
    };

    const requiredCheck = validateRequired(ocrData);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/photo-to-text/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLoading(false);
            if (res.data && res.data.success && res.data.ocr) {
                const base = res.data.ocr || {};
                // build safe defaults so controlled inputs don't break
                const ensure = {
                    ...emptyTemplate(),
                    ...base,
                    studentProfile: { ...emptyTemplate().studentProfile, ...(base.studentProfile || {}) },
                    contactInfo: { ...emptyTemplate().contactInfo, ...(base.contactInfo || {}), address: { ...emptyTemplate().contactInfo.address, ...((base.contactInfo && base.contactInfo.address) || {}) } },
                    familyBackground: {
                        ...emptyTemplate().familyBackground,
                        ...(base.familyBackground || {}),
                        fatherInfo: { ...emptyTemplate().familyBackground.fatherInfo, ...(base.familyBackground?.fatherInfo || {}) },
                        motherInfo: { ...emptyTemplate().familyBackground.motherInfo, ...(base.familyBackground?.motherInfo || {}) },
                        guardian: { ...emptyTemplate().familyBackground.guardian, ...(base.familyBackground?.guardian || {}) },
                        emergency: { ...emptyTemplate().familyBackground.emergency, ...(base.familyBackground?.emergency || {}) }
                    },
                    educationalBackground: base.educationalBackground || {},
                    workExperience: base.workExperience || {},
                    interests: base.interests || {},
                    health: base.health || {},
                    lifeCircumstances: base.lifeCircumstances || {},
                    _raw: res.data.raw || {}
                };

                setOcrData(ensure);
                setActiveTab('profile');
            } else {
                toast.error('OCR returned no usable data.');
                console.warn('OCR response:', res.data);
            }
        } catch (err) {
            setLoading(false);
            console.error('OCR failed', err);
            toast.error(`OCR failed. ${err?.message || ''}`);
        }
    };

    // safe nested setter
    const setNested = (path, value) => {
        setOcrData(prev => {
            const next = JSON.parse(JSON.stringify(prev || emptyTemplate()));
            const keys = path.split('.');
            let cur = next;
            keys.forEach((k, i) => {
                if (i === keys.length - 1) cur[k] = value;
                else {
                    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
                    cur = cur[k];
                }
            });
            return next;
        });
    };

    const handleSave = async () => {
        try {
            const arhived = (ocrData?.sid?.toString()?.toLowerCase()?.includes('prd')) ?? false;
            const final = {
                ...ocrData,
                sid: ocrData?.sid || "",
                studentProfile: ocrData?.studentProfile || {},
                contactInfo: ocrData?.contactInfo || { address: {} },
                isArchived: arhived
            };

            // remove frontend-only fields
            delete final._raw;
            delete final._extra;

            const res = await axios.post("http://localhost:5000/student/create", final);
            console.log("Student creation response:", res);

            toast.success("Student created successfully.");
            setTimeout(() => {
                setOcrData(null);
                setActiveTab('profile');
                setLoading(false);
                if (typeof onOCRSuccess === 'function') onOCRSuccess(final);
                if (typeof onClose === 'function') onClose();
            }, 2000);

        } catch (err) {
            console.error('Save failed', err);
            toast.error(`Error creating student: ${err?.message || ''}`);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Student Profile' },
        { key: 'contact', label: 'Contact Info' },
        { key: 'family', label: 'Family' },
        { key: 'education', label: 'Education' },
        { key: 'raw', label: 'Raw / Extra' },
    ];

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Photo-to-Text (OCR)</h3>
                    <div className="flex gap-2 items-center">
                        <button className="p-2 rounded-lg hover:bg-gray-200" onClick={() => { setOcrData(null); onClose(); }}><X className="w-6 h-6 text-[#0172bd]" /></button>
                    </div>
                </div>

                {!ocrData && (
                    <>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                            <p className="text-gray-700 mb-2">Upload one or more JPEG / PNG / TIFF images (each page).</p>
                            <input id="photoToTextInput" type="file" accept="image/jpeg,image/png,image/tiff" className="hidden" multiple onChange={handleFileChange} />
                            <label htmlFor="photoToTextInput" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg">
                                {loading ? "Scanning..." : "Select Images (multiple allowed)"}
                            </label>
                        </div>
                        <p className="text-gray-500 text-center">After upload, fields will be prefilled automatically and you can correct them below.</p>
                    </>
                )}

                {ocrData && (
                    <>
                        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">Student ID<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.sid} onChange={(v) => setNested('sid', v)} placeholder="SID" />
                                    {requiredCheck.missing.includes('sid') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Name<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.studentProfile.name} onChange={(v) => setNested('studentProfile.name', v)} placeholder="Full name" />
                                    {requiredCheck.missing.includes('studentProfile.name') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Nickname</label>
                                    <NestedInput value={ocrData.studentProfile.nickname} onChange={(v) => setNested('studentProfile.nickname', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Section<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.studentProfile.section} onChange={(v) => setNested('studentProfile.section', v)} />
                                    {requiredCheck.missing.includes('studentProfile.section') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Academic Level<span className='text-red-700'> *</span></label>
                                    <select
                                        value={ocrData.studentProfile.academicLevel}
                                        onChange={(e) => setNested('studentProfile.academicLevel', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    >
                                        <option value="">Select Academic Level</option>
                                        <option value="Tertiary">Tertiary</option>
                                        <option value="Senior High School">Senior High School</option>
                                    </select>
                                    {requiredCheck.missing.includes('studentProfile.academicLevel') && (
                                        <small className="text-red-600">Required</small>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm">Program<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.studentProfile.program} onChange={(v) => setNested('studentProfile.program', v)} />
                                    {requiredCheck.missing.includes('studentProfile.program') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Birthday<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.studentProfile.birthday} onChange={(v) => setNested('studentProfile.birthday', v)} placeholder="MM/DD/YYYY" />
                                    {requiredCheck.missing.includes('studentProfile.birthday') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Gender<span className='text-red-700'> *</span></label>
                                    <select
                                        value={ocrData.studentProfile.gender}
                                        onChange={(e) => setNested('studentProfile.gender', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {requiredCheck.missing.includes('studentProfile.gender') && (
                                        <small className="text-red-600">Required</small>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm">Age<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.studentProfile.age} onChange={(v) => setNested('studentProfile.age', Number.isNaN(Number(v)) ? v : Number(v))} />
                                    {requiredCheck.missing.includes('studentProfile.age') && <small className="text-red-600">Required (number)</small>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">Email<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.contactInfo.email} onChange={(v) => setNested('contactInfo.email', v)} />
                                    {requiredCheck.missing.includes('contactInfo.email') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Mobile<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.contactInfo.contactNo} onChange={(v) => setNested('contactInfo.contactNo', v)} />
                                    {requiredCheck.missing.includes('contactInfo.contactNo') && <small className="text-red-600">Required</small>}
                                </div>
                                <div>
                                    <label className="text-sm">Home No</label>
                                    <NestedInput value={ocrData.contactInfo.homeNo} onChange={(v) => setNested('contactInfo.homeNo', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Work No</label>
                                    <NestedInput value={ocrData.contactInfo.workNo} onChange={(v) => setNested('contactInfo.workNo', v)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Current Address<span className='text-red-700'>*</span></label>
                                    <NestedInput value={ocrData.contactInfo.address.currentAddress} onChange={(v) => setNested('contactInfo.address.currentAddress', v)} />
                                    {requiredCheck.missing.includes('contactInfo.address.currentAddress') && <small className="text-red-600">Required</small>}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Permanent Address</label>
                                    <NestedInput value={ocrData.contactInfo.address.permanentAddress} onChange={(v) => setNested('contactInfo.address.permanentAddress', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'family' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">Father's Name</label>
                                    <NestedInput value={ocrData.familyBackground.fatherInfo?.name} onChange={(v) => setNested('familyBackground.fatherInfo.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Mother's Name</label>
                                    <NestedInput value={ocrData.familyBackground.motherInfo?.name} onChange={(v) => setNested('familyBackground.motherInfo.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Guardian Name</label>
                                    <NestedInput value={ocrData.familyBackground.guardian?.name} onChange={(v) => setNested('familyBackground.guardian.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Emergency Contact</label>
                                    <NestedInput value={ocrData.familyBackground.emergency?.contactNo} onChange={(v) => setNested('familyBackground.emergency.contactNo', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div className="grid grid-cols-1 gap-4">
                                <label className="text-sm">Educational Background / Notes</label>
                                <textarea value={ocrData.educationalBackground?.extra || ''} onChange={(e) => setNested('educationalBackground.extra', e.target.value)} className="w-full border p-2 rounded" />
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <div>
                                <label className="text-sm">Raw key/value pairs (editable)</label>
                                <textarea value={JSON.stringify(ocrData._raw || {}, null, 2)} onChange={(e) => {
                                    try {
                                        setNested('_raw', JSON.parse(e.target.value || '{}'));
                                    } catch (err) {
                                    }
                                }} className="w-full border p-2 rounded h-48" />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => { setOcrData(null); setActiveTab('profile'); }} className="px-4 py-2 rounded bg-gray-100">Scan Again</button>
                            <button
                                onClick={handleSave}
                                disabled={!requiredCheck.valid}
                                className={`px-4 py-2 rounded ${requiredCheck.valid ? 'bg-[#0172bd] text-white' : 'bg-gray-300 text-gray-600'} flex items-center gap-2`}
                            >
                                <Check className="w-4 h-4" /> Save & Use
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhotoToTextModal;
