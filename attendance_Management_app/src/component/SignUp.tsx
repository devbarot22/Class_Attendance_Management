import { FaEye, FaEyeSlash } from 'react-icons/fa';
import GoogleLogo from "../assets/7123025_logo_google_g_icon.svg"
import { useState } from 'react';
import { GoogleAuthProvider, browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getAuth, sendEmailVerification, setPersistence, signInWithPopup, updateProfile } from 'firebase/auth'; // Import the createUserWithEmailAndPassword function
// import { auth } from '../firebaseconfig'; // Import the auth object from your firebase.ts file
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import React from 'react';
import { useNavigate } from 'react-router-dom';


const firebaseErrorCodes = {
  'auth/invalid-email': 'The email address is badly formatted.',
  'auth/user-disabled': 'The user account has been disabled by an administrator.',
  'auth/user-not-found': 'No user found for the provided email.',
  'auth/wrong-password': 'Wrong password provided for the given user.',
  'auth/invalid-credential': 'enter your valid credentials',
  'auth/email-already-in-use': 'This email is already in use'
};




const SignUp = (props:any) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [, setUserEmail] = useState('');

  const [touched, setTouched] = useState({
    fullname: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });


  const navigate = useNavigate();
  const auth = getAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e?.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    setTouched(prevState => ({
      ...prevState,
      [name]: true
    }));

    // Use value directly from the event for validation
    const tempFormData = { ...formData, [name]: value };

    // Perform validation as the user types
    Yup?.object()?.shape({
      fullname: Yup?.string()?.required('Full Name is required'),
      email: Yup?.string()?.email('Invalid email address')?.required('Email is required')?.test('is -valid-email', 'Invalid email address', (value: any) => {
        const regex = /^[^\s@]+@gmail\.com$/i;
        return regex.test(value || '');
      }),
      password: Yup?.string()
        ?.min(8, 'Password must be at least 8 characters')
        ?.matches(/[a-z]/, 'Password must contain at least one lowercase char')
        ?.matches(/[A-Z]/, 'Password must contain at least one uppercase char')
        ?.matches(/[a-zA-Z]+[^a-zA-Z\s]+/, 'Password must contain at least 1 number or special char (@,!,#, etc).')
        ?.required('Password is required'),
      confirmPassword: Yup?.string()
        ?.required('Confirm Password is required')
        ?.test('passwords-match', 'Passwords must match', function (value) {
          return this.parent.password === value;
        })
    })?.validateAt(name, tempFormData)
      ?.then(() => {
        // Clear the error message for the current input field
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: ''
        }));
      })
      ?.catch((validationErrors) => {
        // Set the error message for the current input field
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: validationErrors.errors[0]
        }));
      });
  };

  const navigation = useNavigate();
  const handleSignUp = async (email: string, password: string) => {

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential?.user;
      console.log('User', user);
      // Signed in 
      // Send email verification
      if (user) {
        await updateProfile(user, { displayName: formData.fullname });
        console.log(user.displayName);
        await sendEmailVerification(user);
        // Email verification sent
        toast.success('Redirecting To Verification Page')
        navigation('/VerifyingEmail');
        console.log('Navigate:', navigate);
      }
      console.log('User registered successfully:', user)
    } catch (error: any) {
      const errorCodes: { [key: string]: string } = firebaseErrorCodes;
      console.log()
      toast(errorCodes[(error as any).code] || 'An unexpected error occurred');
    };
  }


  const handleSubmit = async (e: any) => {
    e?.preventDefault();

    try {
      await Yup?.object()?.shape({
        fullname: Yup?.string()?.required('Full Name is required'),
        email: Yup?.string()?.email('Invalid email address')?.required('Email is required'),
        password: Yup?.string()
          ?.min(8, 'Password must be at least 8 characters')
          ?.matches(/[a-z]/, 'Password must contain at least one lowercase char')
          ?.matches(/[A-Z]/, 'Password must contain at least one uppercase char')
          ?.matches(/[a-zA-Z]+[^a-zA-Z\s]+/, 'Password must contain at least 1 number or special char (@,!,#, etc).')
          ?.required('Password is required'),
        confirmPassword: Yup?.string()
          ?.required('Confirm Password is required')
          ?.test('passwords-match', 'Passwords must match', function (value) {
            return this?.parent?.password === value;
          })
      })?.validate(formData, { abortEarly: false });

      const auth = getAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await handleSignUp(formData.email, formData.password);
    } catch (error) {
      if (error instanceof Yup?.ValidationError) {
        const newErrors: { fullname: string; email: string; password: string; confirmPassword: string;[key: string]: string } = {
          fullname: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
        error.inner.forEach((e: Yup.ValidationError) => {
          if (e?.path) {
            newErrors[e?.path] = e?.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle Firebase registration errors
        const errorCodes: { [key: string]: string } = firebaseErrorCodes;
        toast(errorCodes[(error as any).code] || 'An unexpected error occurred');
      }
    }
  };

  const handleGoogleSignUp = async () => {
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
      }
    } catch (error) {
      // Handle Errors here.
      const errorCodes: { [key: string]: string } = firebaseErrorCodes;
      toast(errorCodes[(error as any).code] || 'An unexpected error occurred');
    }
  };

  return (
    <div className="flex flex-col w-1/2 bg-gray-300 min-h-screen justify-center items-center max-md:w-screen">
      <h1 className="mb-4 text-3xl text-center text-black font-semibold">NEW HERE? SIGNUP TO GET STARTED</h1>
      <form onSubmit={handleSubmit} className="flex flex-col p-10 shadow-2xl shadow-slate-800 rounded-lg mt-2">
        <label htmlFor="fullname" className="text-black text-lg w-80">Full Name</label>
        <input
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={handleInputChange}
          autoComplete="off"
          placeholder="Enter Your Full Name"
          id='fullname'
          className={`text-xl placeholder:text-sm  placeholder:text-gray-700 pl-1 py-2 font-thin border placeholder-black text-black border-black outline-none w-80 bg-transparent rounded-[3px] border-x-0 border-t-0 mt-3 ${errors.fullname ? 'border-red-500' : ''}`}
        />
        {touched?.fullname && errors?.fullname && <p className="text-red-500 text-xs w-80">{errors?.fullname}</p>}

        <label htmlFor="email" className="text-black w-80 mt-4">Email</label>
        <input
          type="email"
          name="email"
          value={formData?.email}
          onChange={(e: any) => {
            handleInputChange(e)
          }}
          autoComplete="off"
          placeholder="Enter Your Valid Email"
          id='email'
          className={`text-xl placeholder:text-sm  placeholder:text-gray-700 pl-1 py-2 font-thin border placeholder-black text-black border-black outline-none w-80 bg-transparent rounded-[3px] border-x-0 border-t-0 mt-3 ${errors?.email ? 'border-red-500' : ''}`}
        />
        {touched?.email && errors?.email && <p className="text-red-500 text-xs w-80">{errors?.email}</p>}

        <label htmlFor="Password" className="text-black w-80 mt-4">Create Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData?.password}
            onChange={(e: any) => {
              handleInputChange(e);
            }}
            autoComplete="new-password"
            placeholder="Enter Your Password"
            id='Password'
            className={` text-xl placeholder:text-sm  placeholder:text-gray-700 font-thin pl-1 py-2 border text-black placeholder-black border-black outline-none w-80 bg-transparent border-x-0 border-t-0 rounded-[3px] mt-3  ${errors?.password ? 'border-red-500 z' : ''}`}
          />
          <span>
            <button type='button' className="absolute right-3 top-7 cursor-pointer text-black" onClick={() => setShowPassword(!showPassword)} title='showPassword' >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </span>
        </div>
        {touched?.password && errors?.password && <p className="text-red-700 text-xs w-80">{errors?.password}</p>}

        <label htmlFor="confirmPassword" className="text-black w-80 mt-4">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          autoComplete="new-password"
          placeholder="Confirm Your Password"
          id='confirmPassword'
          className={` text-xl placeholder:text-sm  placeholder:text-gray-700 pl-1 font-thin text-black py-2 border placeholder-black border-black outline-none w-80 bg-transparent border-x-0 border-t-0 rounded-[3px] mt-0 ${errors?.confirmPassword ? 'border-red-500' : ''}`}
        />
        {touched?.confirmPassword && errors?.confirmPassword && <p className="text-red-500 text-xs w-80">{errors?.confirmPassword}</p>}
        <label className="text-black text-xs mt-4 w-80">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e?.target?.checked)}
            className='mr-1'
            name='rememberMe'
          />
          Remember Me
        </label>

        <button type="submit" className="text-black py-2 mt-5 bg-slate-200 text-center w-full shadow-sm shadow-slate-400 rounded-sm cursor-pointer">Sign Up</button>


        <button type="button" className="text-white mt-4 bg-black rounded-[5px] p-[8px]" onClick={handleGoogleSignUp}><img src={GoogleLogo} className="inline-block w-6 h-6 cursor-pointer" alt='Google-logo' /> Sign Up Using Google </button>

        <button onClick={props.toggleForm} type="button" className="max-md:block hidden text-black mt-2 text-center text-sm cursor-pointer hover:text-gray-900">Already Signed In? Sign In</button>
      </form>
    </div>
  );
};

export default SignUp;
