"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useDebounce } from "@/hooks/useDebounce"; // Debounce hook import
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const CURSOR_COLORS = [
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#a855f7",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#84cc16",
];

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}

// Tiptap Inner Editor Component
function TiptapInnerEditor({
  ydoc,
  provider,
  user,
  status,
  bookingId,
  subdomain,
  onSaveStatusChange,
}) {
  const [editorContent, setEditorContent] = useState("");
  const debouncedContent = useDebounce(editorContent, 2000); // 2 seconds debounce delay

  // REST Fallback Auto-save Handler
  const handleFallbackSave = useCallback(
    async (htmlContent) => {
      if (!htmlContent) return;
      onSaveStatusChange({ isSaving: true, lastSavedTime: null });

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notes/${bookingId}/fallback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: htmlContent,
              subdomain,
            }),
          },
        );

        if (response.ok) {
          const time = new Date().toLocaleTimeString();
          onSaveStatusChange({ isSaving: false, lastSavedTime: time });
        } else {
          onSaveStatusChange({ isSaving: false, lastSavedTime: null });
        }
      } catch (error) {
        console.error("Fallback auto-save error:", error);
        onSaveStatusChange({ isSaving: false, lastSavedTime: null });
      }
    },
    [bookingId, subdomain, onSaveStatusChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: "default",
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: user,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[220px] px-4 py-3 text-slate-200 placeholder:text-slate-600 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      // WebSocket বন্ধ থাকলে Local State এডিট করা হবে যা পরে Debounce হয়ে REST API দিয়ে সেভ হবে
      if (status === "disconnected") {
        setEditorContent(editor.getHTML());
      }
    },
  });

  // Debounced auto-save trigger effect
  useEffect(() => {
    if (status === "disconnected" && debouncedContent) {
      handleFallbackSave(debouncedContent);
    }
  }, [debouncedContent, status, handleFallbackSave]);

  if (!editor) return null;

  return (
    <>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950/40 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("bold")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("italic")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("strike")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("bulletList")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("orderedList")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Box */}
      <EditorContent editor={editor} />
    </>
  );
}

// Main Collaborative Container
export default function CollaborativeEditor({
  bookingId,
  subdomain,
  currentUser,
}) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [activeUsers, setActiveUsers] = useState([]);
  const [yjsSession, setYjsSession] = useState(null);

  // Fallback Auto-save States
  const [isSavingFallback, setIsSavingFallback] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const docName = useMemo(() => {
    if (!subdomain || !bookingId) return null;
    return `${subdomain}:${bookingId}`;
  }, [subdomain, bookingId]);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/yjs";

  // Client Mount Check
  useEffect(() => {
    setMounted(true);
  }, []);

  // User Details Setup
  const user = useMemo(() => {
    const name =
      currentUser?.name || `User-${Math.floor(1000 + Math.random() * 9000)}`;
    const color = currentUser?.color || getColorFromName(name);
    return { name, color };
  }, [currentUser]);

  const handleSaveStatusChange = useCallback(({ isSaving, lastSavedTime }) => {
    setIsSavingFallback(isSaving);
    if (lastSavedTime) {
      setLastSavedTime(lastSavedTime);
    }
  }, []);

  // Yjs Instance Creation & Connection Handlers
  useEffect(() => {
    if (!mounted) return;

    const doc = new Y.Doc();
    doc.getXmlFragment("default");

    const provider = new WebsocketProvider(wsUrl, docName, doc, {
      connect: true,
      maxBackoffTime: 5000,
    });

    const handleStatus = ({ status }) => {
      setStatus(status);
      if (status === "disconnected") {
        toast.error(
          "Real-time connection lost. Switched to REST Fallback Mode.",
        );
      } else if (status === "connected") {
        toast.success("Real-time synchronization restored!");
      }
    };

    provider.on("status", handleStatus);

    const awareness = provider.awareness;
    awareness.setLocalStateField("user", user);

    const updateUsers = () => {
      const states = awareness.getStates();
      const users = [];

      states.forEach((state, clientID) => {
        if (state.user) {
          users.push({
            clientID,
            ...state.user,
          });
        }
      });

      setActiveUsers(users);
    };

    awareness.on("change", updateUsers);
    updateUsers();

    setYjsSession({ doc, provider });

    return () => {
      provider.off("status", handleStatus);
      awareness.off("change", updateUsers);
      provider.destroy();
      doc.destroy();
      setYjsSession(null);
    };
  }, [mounted, docName, wsUrl, user]);

  if (!mounted || !yjsSession?.doc || !yjsSession?.provider) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Initializing collaborative engine...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Disconnection Warning Amber Banner */}
      {status === "disconnected" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Real-time server disconnected. Changes are auto-saving locally via
              REST Fallback Mode.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSavingFallback ? (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : lastSavedTime ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Saved at {lastSavedTime}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Editor Header & Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Booking Notes (Real-time)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {activeUsers.map((u) => (
              <div
                key={u.clientID}
                title={u.name}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white border-2 border-slate-900 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: u.color }}
              >
                {u.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <div>
            {status === "connected" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : status === "connecting" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Loader2 className="w-3 h-3 animate-spin" /> Connecting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <WifiOff className="w-3 h-3" /> Offline (Fallback)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tiptap Sub-component */}
      <TiptapInnerEditor
        key={docName}
        ydoc={yjsSession.doc}
        provider={yjsSession.provider}
        user={user}
        status={status}
        bookingId={bookingId}
        subdomain={subdomain}
        onSaveStatusChange={handleSaveStatusChange}
      />
    </div>
  );
}
