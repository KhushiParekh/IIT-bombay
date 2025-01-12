// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [accountType, setAccountType] = useState('user');
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     navigate(accountType === 'company' ? '/company-dashboard' : '/user-dashboard');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
//       >
//         <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//           {isSignUp ? 'Create Account' : 'Welcome Back'}
//         </h2>

//         <div className="flex space-x-4 mb-6">
//           <button
//             onClick={() => setAccountType('user')}
//             className={`flex-1 py-2 rounded-lg ${accountType === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
//           >
//             User
//           </button>
//           <button
//             onClick={() => setAccountType('company')}
//             className={`flex-1 py-2 rounded-lg ${accountType === 'company' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
//           >
//             Company
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {isSignUp && (
//             <>
//               {accountType === 'company' ? (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                     <input
//                       type="text"
//                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter company name"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">GST Number</label>
//                     <input
//                       type="text"
//                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter GST number"
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                     <input
//                       type="text"
//                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter your name"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Username</label>
//                     <input
//                       type="text"
//                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Choose username"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                     <input
//                       type="tel"
//                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter phone number"
//                     />
//                   </div>
//                 </>
//               )}
//             </>
//           )}
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               placeholder="Enter your email"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               placeholder="Enter your password"
//             />
//           </div>
          
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
//           >
//             {isSignUp ? 'Sign Up' : 'Login'}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600">
//           {isSignUp ? 'Already have an account?' : "Don't have an account?"}
//           <button
//             onClick={() => setIsSignUp(!isSignUp)}
//             className="ml-1 text-indigo-600 hover:text-indigo-800"
//           >
//             {isSignUp ? 'Login' : 'Sign Up'}
//           </button>
//         </p>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/user-dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?
          <button
            onClick={() => navigate('/register')}
            className="ml-1 text-indigo-600 hover:text-indigo-800"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;