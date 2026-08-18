import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { userService } from '../../services/userService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        await userService.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="glass-card-dark p-10 rounded-3xl shadow-2xl relative text-center">
      {status === 'verifying' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-3xl flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
          <p className="text-slate-400">Please wait while we verify your email address...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-3xl flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-slate-400 mb-8">{message}</p>
          <Link to="/login" className="inline-flex items-center gap-2 text-gold font-bold hover:gap-4 transition-all">
            Sign In to Your Account <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-slate-400 mb-8">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-gold font-bold hover:gap-4 transition-all">
              Back to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;

