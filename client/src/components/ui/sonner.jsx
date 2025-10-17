import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          background: '#000000',
          color: '#ffffff',
          border: '1px solid #10b981',
        },
        className: 'sonner-toast',
        success: {
          style: {
            background: '#000000',
            color: '#10b981',
            border: '1px solid #10b981',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#000000',
          },
        },
        error: {
          style: {
            background: '#000000',
            color: '#ef4444',
            border: '1px solid #ef4444',
          },
        },
        warning: {
          style: {
            background: '#000000',
            color: '#f59e0b',
            border: '1px solid #f59e0b',
          },
        },
        info: {
          style: {
            background: '#000000',
            color: '#10b981',
            border: '1px solid #10b981',
          },
        },
      }}
      limit={1}
      {...props} />
  );
}

export { Toaster }
