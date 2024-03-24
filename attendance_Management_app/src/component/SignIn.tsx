import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleLogo from "../assets/7123025_logo_google_g_icon.svg";
import { useState } from 'react';
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import * as Yup from 'yup';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {


  //all state variable

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [authError, setAuthError] = useState('');

  const [, setUserEmail] = useState('');


  const [showPassword, setShowPassword] = useState<boolean | undefined>(false);


  //firebase technical errors mapping into user friendly messages

  const firebaseErrorCodes = {
    'auth/invalid-email': 'The email address is badly formatted.',
    'auth/user-disabled': 'The user account has been disabled by an administrator.',
    'auth/user-not-found': 'No user found for the provided email.',
    'auth/wrong-password': 'Wrong password provided for the given user.',
    'auth/invalid-credential': 'enter your valid credentials',
    'auth/email-already-in-use': 'This email is already in use'
  };


  const navigate = useNavigate();

  //submit handling function with error handling 

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const schema = Yup?.object()?.shape({
        email: Yup?.string()?.email('Invalid email address')?.required('Email is required'),
        password: Yup?.string()?.required('Password is required'),
      });

      await schema?.validate(formData, { abortEarly: false });

      signInWithEmailAndPassword(auth, formData?.email, formData?.password)
        ?.then((userCredential) => {
          const user = userCredential?.user;
          console.log('User signed in successfully:', user);
          setErrors({ email: '', password: '' });
          setAuthError('');
          navigate('/MainPage');
        })
        ?.catch((error) => {
          console?.error('Sign-in error:', error?.message);
          const errorCodes: { [key: string]: string } = firebaseErrorCodes;
          setAuthError(errorCodes[error.code] || 'An unexpected error occurred');
        });
    } catch (validationErrors: any) {
      const newErrors: { email: string; password: string } = { email: '', password: '' };
      validationErrors?.inner?.forEach((error: any) => {
        newErrors[error?.path as keyof typeof newErrors] = error?.message;
      });
      setErrors(newErrors);
    }

  };


  //form validation field with error handling

  const validateField = async (name: string, value: string) => {
    try {
      if (name === 'email') {
        await Yup?.string()?.email('Invalid email address')?.required('Email is required')?.validate(value);
      } else if (name === 'password') {
        await Yup?.string()?.required('Password is required')?.validate(value);
      }
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    } catch (error: any) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error.message }));
    }
  };


  //handling input changes passing validateField into it

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };


  //forgetPassword function with the help of firebase 'sendPasswordResetEmail' also with error handling

  const handleForgotPassword = async () => {
    const auth = getAuth();
    const emailAddress = formData.email;

    try {
      await fetchSignInMethodsForEmail(auth, emailAddress);
      // If the previous line didn't throw an error, the email is registered
      await sendPasswordResetEmail(auth, emailAddress);
      toast.success('Password reset email sent to ' + emailAddress, {
        position: 'top-center',
        className: 'bg-green-500 text-black',
      });
    } catch (error: any) {
      const errorCodes: { [key: string]: string } = firebaseErrorCodes;
      toast(errorCodes[(error as any).code] || 'An unexpected error occurred');
    }
  };


  //Google signIn functionality


  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result?.user;

      if (user) {
        // You can access the Google user's info with the `user` object.
        const email: string = user?.email ? user?.email : '';
        setUserEmail(email);
        navigate('/MainPage');
        // ...
      }
    } catch (error) {
      const errorCodes: { [key: string]: string } = firebaseErrorCodes;
      toast(errorCodes[(error as any).code] || 'An unexpected error occurred');
    }
  };



  return (
    <div className="flex flex-col w-1/2 bg-slate-400 min-h-screen justify-center items-center">

      <h1 className="mb-4 text-3xl text-blac font-semibold">SIGN IN TO YOUR ACCOUNT</h1>
      <form onSubmit={handleSubmit} className="flex flex-col p-10 shadow-2xl shadow-slate-800 rounded-lg @">
        <label htmlFor="email" className="text-black text-xl w-80">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleInputChange}
          autoComplete="off"
          placeholder="Enter Your Valid Email"
          className={`text-xl font-serif placeholder:text-xs placeholder:text-gray-300 font-thin mb-4 p-1 py-2 border text-black placeholder-black border-blac outline-none w-80 bg-transparent rounded-[3px] border-x-0 border-t-0 mt-4 ${errors.email ? 'border-red-500' : ''}`}
        />

        <label htmlFor="password" className="text-blac text-xl w-80">Password</label>
        <div className='relative'>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleInputChange}
            autoComplete="new-password"
            placeholder="Enter Your Password"
            id='password'
            className={`text-xl font-serif  placeholder:text-xs text-black placeholder:text-gray-300 font-thin pl-1 py-2 border placeholder-black border-blac outline-none w-80 bg-transparent border-x-0 border-t-0 rounded-[3px] mt-3 ${errors.password ? 'border-red-500' : ''}`}
          />

          <button type='button' className="absolute right-3 top-7 cursor-pointer text-black" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword) }} title='showPassword'>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type='button' onClick={handleForgotPassword} className="text-black text-sm text-left hover:text-gray-700 cursor-pointer">Forgot Password?</button>
        {authError && <p className="text-red-500">{authError}</p>}

        <button type="submit" className="text-black py-2 mt-9 text-center w-full shadow-xl bg-slate-200 cursor-pointer">Sign In</button>

        <button type="button" className="text-white mt-4 bg-black rounded-[5px] p-[8px]" onClick={handleGoogleSignIn}><img src={GoogleLogo} className="inline-block w-6 h-6 cursor-pointer" alt='Google-logo' /> Sign In Using Google </button>
      </form>
    </div>
  );
};

export default SignIn;