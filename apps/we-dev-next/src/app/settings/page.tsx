"use client";

import React, { useEffect, useMemo, useState } from "react";

type ProviderOption = {
  label: string;
  value: string;
  bases: string[];
  models: string[];
};

const PROVIDERS: ProviderOption[] = [
  {
    label: "bolt.diy",
    value: "bolt",
    bases: ["https://api.bolt.diy/v1/"],
    models: [
      "gpt-4o-mini",
      "deepseek-reasoner",
      "deepseek-chat",
      "claude-3-5-sonnet-20240620",
    ],
  },
  {
    label: "OpenAI-compatible",
    value: "openai",
    bases: ["https://api.openai.com/v1/", "https://api.deepseek.com/v1/"],
    models: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4.1-mini",
      "gpt-3.5-turbo",
    ],
  },
  {
    label: "Custom",
    value: "custom",
    bases: [""],
    models: [""],
  },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

export default function SettingsPage() {
  const [provider, setProvider] = useState<string>("bolt");
  const [apiBase, setApiBase] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [scheme, setScheme] = useState<string>("Bearer");

  useEffect(() => {
    const p = getCookie("api_provider");
    const b = getCookie("api_base");
    const m = getCookie("api_model");
    const k = getCookie("api_key");
    const s = getCookie("api_auth_scheme");
    if (p) setProvider(p);
    if (b) setApiBase(b);
    if (m) setModel(m);
    if (k) setApiKey(k);
    if (s) setScheme(s);
    if (!b && !p) {
      // default to bolt
      setApiBase("https://api.bolt.diy/v1/");
    }
  }, []);

  const providerOptions = PROVIDERS;
  const baseOptions = useMemo(() => {
    const match = providerOptions.find((x) => x.value === provider);
    return match?.bases ?? [""];
  }, [provider, providerOptions]);

  const modelOptions = useMemo(() => {
    const match = providerOptions.find((x) => x.value === provider);
    return match?.models ?? [""];
  }, [provider, providerOptions]);

  function handleProviderChange(value: string) {
    setProvider(value);
    setCookie("api_provider", value);
    const match = PROVIDERS.find((x) => x.value === value);
    const firstBase = match?.bases?.[0] ?? "";
    if (firstBase) {
      setApiBase(firstBase);
      setCookie("api_base", firstBase);
    }
  }

  function handleBaseChange(value: string) {
    setApiBase(value);
    setCookie("api_base", value);
  }

  function handleModelChange(value: string) {
    setModel(value);
    setCookie("api_model", value);
  }

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    setCookie("api_key", value);
  }

  function handleSchemeChange(value: string) {
    setScheme(value);
    setCookie("api_auth_scheme", value);
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        API Settings
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Provider</span>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            {providerOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Model</span>
          <select
            value={model}
            onChange={(e) => handleModelChange(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m || "Custom"}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>API Base URL</span>
          <select
            value={baseOptions.includes(apiBase) ? apiBase : "__custom__"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom__") return;
              handleBaseChange(v);
            }}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            {baseOptions.map((b, idx) => (
              <option key={b || idx} value={b || "__custom__"}>
                {b || "Custom..."}
              </option>
            ))}
            {!baseOptions.includes(apiBase) && (
              <option value="__custom__">Custom...</option>
            )}
          </select>
        </label>

        {(!apiBase || !baseOptions.includes(apiBase)) && (
          <input
            type="url"
            placeholder="https://api.example.com/v1/"
            value={apiBase}
            onChange={(e) => handleBaseChange(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        )}

        <div style={{ display: "grid", gap: 6 }}>
          <span>API Key</span>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Auth Scheme</span>
          <select
            value={scheme}
            onChange={(e) => handleSchemeChange(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            {[
              "Bearer",
              "Token",
              "Basic",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div style={{ fontSize: 12, color: "#666" }}>
          Changes are saved to cookies and used by the proxy for /api/* requests.
        </div>
      </div>
    </div>
  );
}

