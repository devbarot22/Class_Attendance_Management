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
        size="35"
        round={true}
        className='mr-5'
        onClick={toggleDropDown}
      />
      {dropDownVisible && (
        <div style={{ position: 'absolute', right: 0, padding: '10px', marginRight: '20px', zIndex: 1, backgroundColor: 'gray', marginTop: '20vh', borderRadius: '5px' }}>
          <Link to="/AuthPage" className='text-sm text-center mt-3 text-white' onClick={handleSignOut}><button type='button' onClick={() => setDropDownVisible(false)} >SignOut</button>
            <hr className='mt-3' />
            <div className="text-white text-xs text-center mt-5 cursor-default">{authUser.displayName}</div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
