import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ZKEmailModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [requestUrl, setRequestUrl] = useState('');
  const [proofData, setProofData] = useState(null);
  const [sessionInterval, setSessionInterval] = useState(null);

  const APP_ID = '0x082C2729BF4894266f97DC789008cb72c5fBD0f7';
  const APP_SECRET = '0xc5be4da656910b181c351c1921544a0371a069b73e4bf97e33a08fe77dd0207c';
  const PROVIDER_ID = 'google-login';

  useEffect(() => {
    // Fetch user email from Firebase when modal opens
    if (isOpen) {
      fetchUserEmail();
    }

    return () => {
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [isOpen]);

  const fetchUserEmail = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // First try to get email from auth
      let email = auth.currentUser.email;

      // If not in auth, try Firestore
      if (!email) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          email = userDoc.data().email;
        }
      }

      if (!email) {
        throw new Error('No email found for user');
      }

      setUserEmail(email);
    } catch (err) {
      setError(err.message || 'Failed to fetch user email');
    }
  };

  const initiateProofRequest = async () => {
    if (!userEmail) {
      setError('No email address available to verify');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In production, replace with actual ReclaimProofRequest implementation
      const requestParams = {
        title: "Email Verification",
        requestedProofs: [
          {
            name: "email-verify",
            provider: PROVIDER_ID,
            params: {
              emailAddress: userEmail // Use the fetched email
            }
          }
        ]
      };

      // Mock of the proof generation process
      const mockGenerateProof = async () => {
        setRequestUrl('reclaim://proof/request?request_id=123...');
        
        const interval = setInterval(() => {
          clearInterval(interval);
          setProofData({
            id: "proof-" + Date.now(),
            timestamp: new Date().toISOString(),
            provider: PROVIDER_ID,
            parameters: {
              emailAddress: userEmail
            },
            ownerPublicKey: "0x123...",
            signatures: {
              r: "0xabc...",
              s: "0xdef...",
              v: 27
            },
            contextMessage: `Email ownership verified for ${userEmail}`,
            epoch: Date.now(),
            witnessAddress: "0x789..."
          });
          setVerificationStatus('success');
          setLoading(false);
        }, 3000);

        setSessionInterval(interval);
      };

      await mockGenerateProof();
    } catch (err) {
      setError(err.message || 'Failed to generate proof');
      setVerificationStatus('error');
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (sessionInterval) {
      clearInterval(sessionInterval);
    }
    setIsOpen(false);
    setVerificationStatus('idle');
    setProofData(null);
    setRequestUrl('');
    setError('');
    setUserEmail('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Verify Email
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                ZK Email Verification
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {userEmail && !proofData && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Verifying email: <span className="font-medium">{userEmail}</span>
                  </p>
                </div>
              )}

              {!proofData && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Generate a zero-knowledge proof to verify your email ownership without revealing the actual email address.
                  </p>
                  
                  <button
                    onClick={initiateProofRequest}
                    disabled={loading || !userEmail}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      loading || !userEmail
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Generating Proof...
                      </span>
                    ) : !userEmail ? (
                      'Loading Email...'
                    ) : (
                      'Start Verification'
                    )}
                  </button>
                </div>
              )}

              {requestUrl && !proofData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Scan QR Code to Verify
                  </h4>
                  <div className="bg-white p-4 rounded flex justify-center">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                      QR Code Placeholder
                    </div>
                  </div>
                </div>
              )}

              {proofData && (
                <div className="space-y-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Email verification successful!
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Proof Details
                    </h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(proofData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ZKEmailModal ;