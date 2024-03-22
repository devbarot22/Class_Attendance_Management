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
    <div style={{ position: 'relative', height: '4rem', display: 'flex', cursor: 'pointer', right: '0', alignItems: 'center', justifyContent: 'flex-end', }}>
      <Avatar
        name={authUser?.displayName}
        src={authUser?.photoUrl}
        size="30"
        round={true}
        className='mr-5'
        onClick={toggleDropDown}
      />
      {dropDownVisible && (
        <div style={{ position: 'absolute', padding: '12px', marginRight: '20px', zIndex: 1, backgroundColor: 'gray', marginTop: '35vh', borderRadius: '5px', textAlign: 'center' }}>
          <Link to="/AuthPage" className='text-sm text-white hover:text-slate-400' onClick={handleSignOut}><button type='button' className='mt-4 mb-2' onClick={() => setDropDownVisible(false)} >SignOut</button>
          </Link>
          <hr className='mt-3 mb-3 text-white' />
          <div className="grid place-items-center cursor-default">
            <p className='text-white'>User Info</p>
            <hr className='mt-3 w-2/3' />
            <div className="text-white text-xs mt-5 cursor-default">{authUser.displayName}</div>
            <div className="text-white text-xs mt-5 mb-4 cursor-default">{authUser.email}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
