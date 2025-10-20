import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const provider = window.location.pathname.includes('github') ? 'github' : 'google';

      if (error) {
        throw new Error(error);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      setMessage(`Authenticating with ${provider}...`);

      // Send code to backend for token exchange
      const response = await api.post(`/auth/${provider}/callback`, { code });

      if (response.data.token && response.data.user) {
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Store token and user
        localStorage.setItem('token', response.data.token);
        login(response.data.user);

        toast.success(`Welcome ${response.data.user.name}!`);

        // Redirect to intended page or dashboard
        const redirectTo = sessionStorage.getItem('auth_redirect') || '/dashboard';
        sessionStorage.removeItem('auth_redirect');
        
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || error.message || 'Authentication failed');
      toast.error('Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-600" />
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600" />
              <Button onClick={() => navigate('/login')} className="w-full">
                Return to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
