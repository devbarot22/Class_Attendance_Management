import React, { useState } from 'react';
import Avatar from 'react-avatar';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const UserProfile = ({ authUser }: { authUser: any }) => {
  const [dropDownVisible, setDropDownVisible] = useState(false);

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setDropDownVisible(false);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };
  const toggleDropDown = () => {
    setDropDownVisible(!dropDownVisible);
  }

  return (
    <div className='flex relative h-16 cursor-pointer right-0 items-center justify-end'>
      <Avatar
        name={authUser?.displayName}
        src={authUser?.photoUrl}
        size="30"
        round={true}
        className='mr-5'
        onClick={toggleDropDown}
      />
      {dropDownVisible && (
        <div className='sm:text-sm absolute p-3 sm:w-24 mr-5 z-10 rounded-xl bg-gray-500 sm:mt-44 max-sm:mt-40 max-sm:text-xs max-sm:w-24 flex flex-col items-center text-center text-wrap'>
          <Link to="/AuthPage" className='text-sm text-white hover:text-slate-400' onClick={handleSignOut}><button type='button' className='max-sm:mt-px max-sm:text-xs' onClick={() => setDropDownVisible(false)} >SignOut</button>
          <hr className='sm:mt-3 sm:mb-2 max-sm:mt-3 max-sm:mb-3 max-sm:w-24 text-white' />
          </Link>
          <div className="grid place-items-center cursor-default">
            <p className='text-white'>User Info</p>
            <hr className='sm:mt-2 sm:w-2/3 max-sm:mt-px max-sm:w-12' />
            <div className="text-white text-xs sm:mt-2 max-sm:mt-1 cursor-default">{authUser.displayName}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
