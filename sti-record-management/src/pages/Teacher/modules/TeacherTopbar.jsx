import DefaultPic from '../../../assets/user.png'
import STILogo from '../../../assets/sti-logo.png' // Add your STI logo image to assets

function TeacherTopbar() {
    return (
        <div className="w-full flex items-center justify-between bg-white border-b-2 border-blue-700 px-6 py-3">
            <div className="flex items-center">
                <img 
                    src={STILogo}
                    alt='STI Logo'
                    className="w-14 h-10 mr-3"
                />
                <h3 className="text-xl font-semibold text-black">
                    Guidance and Counseling Online Slip Request
                </h3>
            </div>
            <img
                src={DefaultPic}
                alt='Profile Picture'
                className="w-10 h-10 rounded-full border border-gray-300"
            />
        </div>
    )
}

export default TeacherTopbar;