import { Button } from '@/components/ui/button';
import { Github, Chrome, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

const OAuthButtons = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const [loading, setLoading] = useState({ github: false, google: false });

  const handleGitHubLogin = async () => {
    setLoading({ ...loading, github: true });
    try {
      // Redirect to GitHub OAuth
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = 'read:user user:email';
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      // Save the intended redirect URL
      sessionStorage.setItem('auth_redirect', redirectTo);
      
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error('Failed to initialize GitHub login');
      setLoading({ ...loading, github: false });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading({ ...loading, google: true });
    try {
      // Initialize Google OAuth
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'email profile';
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      
      // Save the intended redirect URL
      sessionStorage.setItem('auth_redirect', redirectTo);
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initialize Google login');
      setLoading({ ...loading, google: false });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGitHubLogin}
          disabled={loading.github}
          className="w-full"
        >
          {loading.github ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading.google}
          className="w-full"
        >
          {loading.google ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default OAuthButtons;
