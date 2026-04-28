import { type Editor } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  const tools = [
    {
      icon: BoldIcon,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      label: "Bold",
    },
    {
      icon: ItalicIcon,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      label: "Italic",
    },
    {
      icon: ListBulletIcon,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      label: "Bullet List",
    },
    {
      icon: NumberedListIcon,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      label: "Numbered List",
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-stone-200 bg-stone-50 rounded-t-lg">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={tool.action}
          className={`p-1.5 rounded-md transition-colors ${
            tool.isActive
              ? "bg-amber-100 text-amber-700"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          }`}
          title={tool.label}
          type="button"
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}

      <div className="w-px h-5 bg-stone-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Undo"
        type="button"
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Redo"
        type="button"
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default EditorToolbar;
