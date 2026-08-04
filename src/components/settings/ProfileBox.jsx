import { useEffect } from "react";
import { PiPencilSimpleBold } from "react-icons/pi";
import PortraitPlaceholder from "../commons/PortraitPlaceholder";

const ProfileBox = ({ openModal, myInfo, isAdmin = false }) => {
  useEffect(() => {
    console.log("myInfo: ", myInfo);
  }, [myInfo]);

  return (
    <div className="w-full flex items-center bg-white border border-unddisabled rounded-2xl px-3 shadow-md h-24">
      <div className="w-full flex items-center gap-3">
        <div className=" h-16 flex justify-center items-center">
          {isAdmin ||
          !myInfo?.profileImage ||
          myInfo.profileImage === "defaultProfileImage.jpg" ? (
            <PortraitPlaceholder iconSize={36} circleSize={16} />
          ) : (
            <div className="w-16 h-16 rounded-full">
              <img
                alt="myProfileImage"
                src={myInfo?.profileImage}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-2 px-2">
          <div className="flex justify-between">
            <span className="text-undtextdark text-base font-extrabold">
              {myInfo?.nickname}
            </span>
            {!isAdmin && (
              <PiPencilSimpleBold
                size={24}
                color="78716C"
                onClick={() => openModal(true)}
              />
            )}
          </div>
          <div className="flex justify-start text-undtextgray text-base text-und14">
            {myInfo?.honorific}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBox;
