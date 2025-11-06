import React, { useState, useContext } from 'react';
import axios from 'axios';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from "../../../../AuthProvider.jsx";

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
    <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border px-2 py-1 rounded"
    />
);

const emptyTemplate = () => ({
    sid: '',
    isArchived: false,
    studentProfile: {
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        nickname: '',
        section: '',
        academicLevel: '',
        nationality: 'Filipino',
        gender: '',
        status: '',
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
        fatherInfo: { name: '', nationality: '', religion: '', occupation: '' },
        motherInfo: { name: '', nationality: '', religion: '', occupation: '' },
        guardian: { name: '', contactNo: '' },
        emergency: { name: '', contactNo: '' },
        siblings: [],
        statusOfParent: ''
    },
});

const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const PhotoToTextModal = ({ visible, onClose, onOCRSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [ocrData, setOcrData] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [defaultPassword, setDefaultPassword] = useState('student1234');
    const [showPassword, setShowPassword] = useState(false);
    const { authData } = useContext(AuthContext);

    if (!visible) return null;

    const validateRequired = (data) => {
        const missing = [];
        if (!data) return { valid: false, missing: ['Please scan an image'] };
        const sid = (data.sid || '').toString().trim();
        const sp = data.studentProfile || {};
        const ci = data.contactInfo || {};

        if (!sid) missing.push('Student ID is required');
        if (!sp.lastName || !sp.firstName) missing.push('First and Last Name are required');
        if (!sp.academicLevel) missing.push('Academic Level is required');
        if (!sp.program) missing.push('Program is required');
        if (!sp.birthday) missing.push('Birthdate is required');
        if (!sp.gender) missing.push('Gender is required');
        if (!ci.email) missing.push('Email is required');
        else if (!isValidEmail(ci.email)) missing.push('Email format is incorrect');
        if (!ci.contactNo) missing.push('Mobile is required');

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
            const res = await axios.post('/photo-to-text/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLoading(false);
            if (res.data && res.data.success && res.data.ocr) {
                const base = res.data.ocr || {};
                const ensure = {
                    ...emptyTemplate(),
                    ...base,
                    studentProfile: { ...emptyTemplate().studentProfile, ...(base.studentProfile || {}) },
                    contactInfo: {
                        ...emptyTemplate().contactInfo,
                        ...(base.contactInfo || {}),
                        address: {
                            ...emptyTemplate().contactInfo.address,
                            ...((base.contactInfo && base.contactInfo.address) || {})
                        }
                    },
                    familyBackground: {
                        ...emptyTemplate().familyBackground,
                        ...(base.familyBackground || {}),
                        fatherInfo: { ...emptyTemplate().familyBackground.fatherInfo, ...(base.familyBackground?.fatherInfo || {}) },
                        motherInfo: { ...emptyTemplate().familyBackground.motherInfo, ...(base.familyBackground?.motherInfo || {}) },
                        guardian: { ...emptyTemplate().familyBackground.guardian, ...(base.familyBackground?.guardian || {}) },
                        emergency: { ...emptyTemplate().familyBackground.emergency, ...(base.familyBackground?.emergency || {}) },
                        siblings: base.familyBackground?.siblings || [],
                        statusOfParent: base.familyBackground?.statusOfParent || ''
                    },
                    _raw: res.data.raw || {},
                    _extra: base._extra || {}
                };
                setOcrData(ensure);
                setActiveTab('profile');
            } else {
                toast.error('OCR returned no usable data.');
            }
        } catch (err) {
            setLoading(false);
            toast.error(`OCR failed. ${err?.message || ''}`);
        }
    };

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
        if (!requiredCheck.valid) {
            toast.error(`Invalid fields: ${requiredCheck.missing.join(', ')}`);
            return;
        }
        try {
            setIsSaving(true);
            const archived = (ocrData?.sid?.toString()?.toLowerCase()?.includes('prd')) ?? false;
            const final = {
                ...ocrData,
                processedBy: authData?.displayName ?? 'Admin',
                sid: ocrData?.sid || "",
                studentProfile: ocrData?.studentProfile || {},
                contactInfo: ocrData?.contactInfo || { address: {} },
                isArchived: archived
            };

            delete final._raw;
            delete final._extra;

            await axios.post("/student/create", final);
            toast.success("Student created successfully.");
            setTimeout(() => {
                setOcrData(null);
                setActiveTab('profile');
                setIsSaving(false);
                if (typeof onOCRSuccess === 'function') onOCRSuccess(final);
                if (typeof onClose === 'function') onClose();
            }, 2000);
        } catch (err) {
            setIsSaving(false);
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred';
            toast.error(`Error creating student: ${errorMessage}`);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Student Profile' },
        { key: 'contact', label: 'Contact Info' },
        { key: 'family', label: 'Family' },
        { key: 'raw', label: 'Raw / Extra' },
    ];

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Photo-to-Text (OCR)</h3>
                    <button className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer" onClick={() => { setOcrData(null); onClose(); }}>
                        <X className="w-6 h-6 text-[#0172bd]" />
                    </button>
                </div>

                {!ocrData && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                        <p className="text-gray-700 mb-2">Upload JPEG/PNG/TIFF images.</p>
                        <input id="photoToTextInput" type="file" accept="image/jpeg,image/png,image/tiff" className="hidden" multiple onChange={handleFileChange} />
                        <label htmlFor="photoToTextInput" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg">
                            {loading ? "Scanning..." : "Select Images"}
                        </label>
                    </div>
                )}

                {ocrData && (
                    <>
                        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">
                                        Student ID<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <NestedInput value={ocrData.sid} onChange={(v) => setNested('sid', v)} placeholder="SID" />
                                </div>

                                {/* Split Name Fields */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm">
                                            Last Name<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                        </label>
                                        <NestedInput value={ocrData.studentProfile.lastName} onChange={(v) => setNested('studentProfile.lastName', v)} />
                                    </div>
                                    <div>
                                        <label className="text-sm">
                                            First Name<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                        </label>
                                        <NestedInput value={ocrData.studentProfile.firstName} onChange={(v) => setNested('studentProfile.firstName', v)} />
                                    </div>
                                    <div>
                                        <label className="text-sm">Middle Name</label>
                                        <NestedInput value={ocrData.studentProfile.middleName} onChange={(v) => setNested('studentProfile.middleName', v)} />
                                    </div>
                                    <div>
                                        <label className="text-sm">Suffix</label>
                                        <NestedInput value={ocrData.studentProfile.suffix} onChange={(v) => setNested('studentProfile.suffix', v)} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm">Nickname</label>
                                    <NestedInput value={ocrData.studentProfile.nickname} onChange={(v) => setNested('studentProfile.nickname', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Section</label>
                                    <NestedInput value={ocrData.studentProfile.section} onChange={(v) => setNested('studentProfile.section', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Academic Level<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <select
                                        value={ocrData.studentProfile.academicLevel}
                                        onChange={(e) => setNested('studentProfile.academicLevel', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="Tertiary">Tertiary</option>
                                        <option value="Senior High School">Senior High School</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Program<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <NestedInput value={ocrData.studentProfile.program} onChange={(v) => setNested('studentProfile.program', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Birthdate<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <NestedInput value={ocrData.studentProfile.birthday} onChange={(v) => setNested('studentProfile.birthday', v)} placeholder="YYYY-MM-DD" />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Gender<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <select
                                        value={ocrData.studentProfile.gender}
                                        onChange={(e) => setNested('studentProfile.gender', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm">Status</label>
                                    <NestedInput value={ocrData.studentProfile.status} onChange={(v) => setNested('studentProfile.status', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Religion</label>
                                    <NestedInput value={ocrData.studentProfile.religion} onChange={(v) => setNested('studentProfile.religion', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Nationality</label>
                                    <NestedInput value={ocrData.studentProfile.nationality} onChange={(v) => setNested('studentProfile.nationality', v)} />
                                </div>

                                {/* Default Password Section */}
                                <div className="col-span-2 mt-4">
                                    <label className="block text-sm font-medium text-[#0172bd]">Default Password</label>
                                    <div className="mt-1 flex items-center">
                                        <span className="block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100 px-3 py-1 bg-gray-50 text-gray-900">
                                            {showPassword ? defaultPassword : '******'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">
                                        Email<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    {ocrData._extra?.emails && ocrData._extra.emails.length > 1 ? (
                                        <select
                                            value={ocrData.contactInfo.email}
                                            onChange={(e) => setNested('contactInfo.email', e.target.value)}
                                            className="w-full border px-2 py-1 rounded"
                                        >
                                            {ocrData._extra.emails.map((em) => (
                                                <option key={em} value={em}>
                                                    {em}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <NestedInput value={ocrData.contactInfo.email} onChange={(v) => setNested('contactInfo.email', v)} />
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Mobile<span className='text-red-700'>*</span> <span className="text-gray-500">(Required)</span>
                                    </label>
                                    <NestedInput value={ocrData.contactInfo.contactNo} onChange={(v) => setNested('contactInfo.contactNo', v)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Current Address</label>
                                    <NestedInput value={ocrData.contactInfo.address.currentAddress} onChange={(v) => setNested('contactInfo.address.currentAddress', v)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Permanent Address</label>
                                    <NestedInput value={ocrData.contactInfo.address.permanentAddress} onChange={(v) => setNested('contactInfo.address.permanentAddress', v)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Provincial Address</label>
                                    <NestedInput value={ocrData.contactInfo.address.provincialAddress} onChange={(v) => setNested('contactInfo.address.provincialAddress', v)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'family' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 font-bold">Father's Information</div>
                                <div>
                                    <label className="text-sm">Name</label>
                                    <NestedInput value={ocrData.familyBackground.fatherInfo?.name} onChange={(v) => setNested('familyBackground.fatherInfo.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Nationality</label>
                                    <NestedInput value={ocrData.familyBackground.fatherInfo?.nationality} onChange={(v) => setNested('familyBackground.fatherInfo.nationality', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Religion</label>
                                    <NestedInput value={ocrData.familyBackground.fatherInfo?.religion} onChange={(v) => setNested('familyBackground.fatherInfo.religion', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Occupation</label>
                                    <NestedInput value={ocrData.familyBackground.fatherInfo?.occupation} onChange={(v) => setNested('familyBackground.fatherInfo.occupation', v)} />
                                </div>
                                <div className="col-span-2 font-bold">Mother's Information</div>
                                <div>
                                    <label className="text-sm">Name</label>
                                    <NestedInput value={ocrData.familyBackground.motherInfo?.name} onChange={(v) => setNested('familyBackground.motherInfo.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Nationality</label>
                                    <NestedInput value={ocrData.familyBackground.motherInfo?.nationality} onChange={(v) => setNested('familyBackground.motherInfo.nationality', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Religion</label>
                                    <NestedInput value={ocrData.familyBackground.motherInfo?.religion} onChange={(v) => setNested('familyBackground.motherInfo.religion', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Occupation</label>
                                    <NestedInput value={ocrData.familyBackground.motherInfo?.occupation} onChange={(v) => setNested('familyBackground.motherInfo.occupation', v)} />
                                </div>
                                <div className="col-span-2 font-bold">Guardian</div>
                                <div>
                                    <label className="text-sm">Name</label>
                                    <NestedInput value={ocrData.familyBackground.guardian?.name} onChange={(v) => setNested('familyBackground.guardian.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Contact No</label>
                                    <NestedInput value={ocrData.familyBackground.guardian?.contactNo} onChange={(v) => setNested('familyBackground.guardian.contactNo', v)} />
                                </div>
                                <div className="col-span-2 font-bold">Emergency Contact</div>
                                <div>
                                    <label className="text-sm">Name</label>
                                    <NestedInput value={ocrData.familyBackground.emergency?.name} onChange={(v) => setNested('familyBackground.emergency.name', v)} />
                                </div>
                                <div>
                                    <label className="text-sm">Contact No</label>
                                    <NestedInput value={ocrData.familyBackground.emergency?.contactNo} onChange={(v) => setNested('familyBackground.emergency.contactNo', v)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Status of Parents</label>
                                    <select
                                        value={ocrData.familyBackground.statusOfParent}
                                        onChange={(e) => setNested('familyBackground.statusOfParent', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Separated">Separated</option>
                                        <option value="Widowed/Widower">Widowed/Widower</option>
                                        <option value="Remarried">Remarried</option>
                                        <option value="Single Parent">Single Parent</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm">Siblings (comma separated)</label>
                                    <input
                                        value={(ocrData.familyBackground.siblings || []).join(', ')}
                                        onChange={(e) =>
                                            setNested(
                                                'familyBackground.siblings',
                                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                            )
                                        }
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <div>
                                <textarea
                                    value={JSON.stringify(ocrData._raw || {}, null, 2)}
                                    onChange={(e) => {
                                        try { setNested('_raw', JSON.parse(e.target.value || '{}')); } catch { }
                                    }}
                                    className="w-full border p-2 rounded h-48"
                                />
                            </div>
                        )}

                        {!requiredCheck.valid && (
                            <div className="text-red-500 mb-2">
                                Please fill in the following: {requiredCheck.missing.join(', ')}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            {/* Scan Again Button */}
                            <button
                                onClick={() => {
                                    setOcrData(null);
                                    setActiveTab('profile');
                                }}
                                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer transition duration-150 ease-in-out"
                            >
                                Scan Again
                            </button>

                            {/* Save & Use Button */}
                            <button
                                onClick={handleSave}
                                disabled={!requiredCheck.valid || isSaving}
                                className={`px-4 py-2 rounded flex items-center gap-2 transition duration-150 ease-in-out ${
                                    !requiredCheck.valid || isSaving
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-[#0172bd] text-white hover:bg-[#005fa3] cursor-pointer'
                                }`}
                            >
                                <Check className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save & Use'}
                            </button>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default PhotoToTextModal;