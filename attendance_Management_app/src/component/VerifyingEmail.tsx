import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { auth } from '../firebaseconfig'; // adjust the path to match your file structure

const VerifyingEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await reload(user); // Reload to get the latest user info
        if (user.emailVerified) {
          navigate('/MainPage');
        }
      }
    });

    return () => {
      unsubscribe(); // Clean up on unmount
    };
  }, [navigate]);

  return (
    <>
      <h2 className='mt-2 ml-2 text-lg' >Please Check Your Mail, We have sent you the verification link once verified you will be redirected to <strong>AttendIt</strong> page</h2>
      <p className='ml-2'>After Verifying if you haven't redirected to AttendIt page, <strong>Please Reload</strong>.</p>
    </>
  )
}

export default VerifyingEmail