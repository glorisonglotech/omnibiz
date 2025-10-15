import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Protected Route Component
 * Wraps routes that require specific permissions
 */
export const ProtectedRoute = ({ children, resource, action = 'read', requiredRoles = [] }) => {
  const { canAccess, hasRole, user } = usePermissions();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/loginpage" replace />;
  }

  // Check role-based access if requiredRoles specified
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <AccessDenied />;
  }

  // Check permission-based access if resource and action specified
  if (resource && !canAccess(resource, action)) {
    return <AccessDenied />;
  }

  return children;
};

/**
 * Access Denied Component
 * Displayed when user doesn't have required permissions
 */
export const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Protected Component - Conditionally renders children based on permissions
 */
export const Protected = ({ children, resource, action = 'read', fallback = null }) => {
  const { canAccess } = usePermissions();

  if (!canAccess(resource, action)) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
