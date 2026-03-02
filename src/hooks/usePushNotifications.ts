import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VAPID_PUBLIC_KEY = "BJkEEqX8DmY0AkSp1ffwvMTqrQdE852M4KmYhI2z2mwSGCbKWCEVvRCjQrgwZfoeZo3IemSUgalu43tTJUOrCwk";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const { session } = useAuth();
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermissionState);
  }, []);

  const subscribe = useCallback(async () => {
    if (!session?.user?.id) return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

    setSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result !== "granted") {
        setSubscribing(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subJson.keys?.p256dh ?? "",
          auth_key: subJson.keys?.auth ?? "",
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("Erro ao salvar subscription:", error);
        setSubscribing(false);
        return false;
      }

      setSubscribing(false);
      return true;
    } catch (err) {
      console.error("Erro ao se inscrever para push:", err);
      setSubscribing(false);
      return false;
    }
  }, [session?.user?.id]);

  return {
    permission,
    subscribing,
    subscribe,
    isSupported: permission !== "unsupported",
  };
}
