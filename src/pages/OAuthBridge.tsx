import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type OAuthBridgeMode = "initiate" | "callback";

const OAUTH_BROKER_BASE_URL = "https://oauth.lovable.app";

export default function OAuthBridge({ mode }: { mode: OAuthBridgeMode }) {
  const location = useLocation();

  useEffect(() => {
    const brokerPath = mode === "initiate" ? "/initiate" : "/callback";
    const targetUrl = `${OAUTH_BROKER_BASE_URL}${brokerPath}${location.search}${location.hash}`;
    window.location.replace(targetUrl);
  }, [location.hash, location.search, mode]);

  return null;
}
