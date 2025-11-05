import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAlreadyLoggedIn } from "../../api/axios";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      checkAlreadyLoggedIn();
      setLoading(false);
    })();
  }, [navigate]);

  // Prevent rendering anything until login check finishes
  if (loading) return null; // or <Spinner /> for UX

  return <>{children}</>;
}
