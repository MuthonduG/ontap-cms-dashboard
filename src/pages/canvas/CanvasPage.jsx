import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// Import specific extensions instead of StarterKit
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon, 
  Image as ImageIcon,
  Code,
  X,
  Upload,
  Eye,
  Save,
  Send,
  AlignLeft,
  ImagePlus,
  Trash2,
  Search,
  Hash,
  Calendar,
  Globe
} from 'lucide-react';

// Import languages for lowlight
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight();

// Register languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('csharp', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('kotlin', kotlin);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('bash', bash);

// Custom Image extension with remove button
const CustomImage = Image.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'blog-image',
      },
    };
  },
});

// SEO Sidebar Component
const SEOSidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  body, 
  featuredImageAlt,
  onSEODataChange,
  seoData 
}) => {
  const [localData, setLocalData] = useState({
    meta_description: '',
    primary_keyword: '',
    secondary_keywords: '',
    canonical_url: '',
    search_intent: 'informational',
    featured_image_alt: '',
    ...seoData
  });

  useEffect(() => {
    setLocalData({
      meta_description: '',
      primary_keyword: '',
      secondary_keywords: '',
      canonical_url: '',
      search_intent: 'informational',
      featured_image_alt: featuredImageAlt || '',
      ...seoData
    });
  }, [seoData, featuredImageAlt]);

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onSEODataChange(updated);
  };

  const handleSecondaryKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const updated = { ...localData, secondary_keywords: keywords };
    setLocalData(updated);
    onSEODataChange(updated);
  };

  const calculateWordCount = () => {
    const text = body?.replace(/<[^>]*>/g, ' ') || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const calculateReadingTime = () => {
    const wordCount = calculateWordCount();
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const calculateHeadingCount = (tag) => {
    const matches = body?.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || [];
    return matches.length;
  };

  const seoIndicators = {
    word_count: calculateWordCount(),
    reading_time_minutes: calculateReadingTime(),
    h1_count: calculateHeadingCount('h1'),
    h2_count: calculateHeadingCount('h2'),
    h3_count: calculateHeadingCount('h3'),
    meta_title_length: title ? title.length : 0,
    meta_description_length: localData.meta_description ? localData.meta_description.length : 0,
    has_featured_image_alt: !!localData.featured_image_alt,
    has_primary_keyword: !!localData.primary_keyword,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">SEO & Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* SEO Indicators */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO Indicators</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Word Count:</span>
              <span className={`ml-2 font-medium ${seoIndicators.word_count >= 300 ? 'text-green-600' : 'text-yellow-600'}`}>
                {seoIndicators.word_count}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Reading Time:</span>
              <span className="ml-2 font-medium text-gray-700">
                {seoIndicators.reading_time_minutes} min
              </span>
            </div>
            <div>
              <span className="text-gray-500">H1 Headings:</span>
              <span className={`ml-2 font-medium ${seoIndicators.h1_count === 1 ? 'text-green-600' : 'text-red-600'}`}>
                {seoIndicators.h1_count}
              </span>
            </div>
            <div>
              <span className="text-gray-500">H2 Headings:</span>
              <span className={`ml-2 font-medium ${seoIndicators.h2_count >= 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                {seoIndicators.h2_count}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Fields */}
        <div className="space-y-6">
          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Search size={14} />
                Meta Description
                <span className="text-xs text-gray-500">
                  ({seoIndicators.meta_description_length}/160)
                </span>
              </div>
            </label>
            <textarea
              value={localData.meta_description}
              onChange={(e) => handleChange('meta_description', e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Brief description for search results..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 120-160 characters
            </p>
          </div>

          {/* Primary Keyword */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Hash size={14} />
                Primary Keyword
              </div>
            </label>
            <input
              type="text"
              value={localData.primary_keyword}
              onChange={(e) => handleChange('primary_keyword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Main SEO keyword"
              maxLength={120}
            />
          </div>

          {/* Secondary Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Keywords
            </label>
            <input
              type="text"
              value={localData.secondary_keywords?.join(', ') || ''}
              onChange={(e) => handleSecondaryKeywordsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="comma, separated, keywords"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate with commas
            </p>
          </div>

          {/* Search Intent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Intent
            </label>
            <select
              value={localData.search_intent}
              onChange={(e) => handleChange('search_intent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="informational">Informational</option>
              <option value="commercial">Commercial</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe size={14} />
                Canonical URL
              </div>
            </label>
            <input
              type="url"
              value={localData.canonical_url}
              onChange={(e) => handleChange('canonical_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="https://example.com/blog/slug"
            />
          </div>

          {/* Featured Image Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image Alt Text
            </label>
            <input
              type="text"
              value={localData.featured_image_alt}
              onChange={(e) => handleChange('featured_image_alt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Describe the featured image"
              maxLength={125}
            />
          </div>

          {/* Schedule Publish */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                Schedule Publish (Optional)
              </div>
            </label>
            <input
              type="datetime-local"
              onChange={(e) => handleChange('scheduled_publish_at', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuBar = ({ editor, onAddLink, onAddImage, onAddCode }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bold"
          >
            <BoldIcon size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Italic"
          >
            <ItalicIcon size={18} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Special Features */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAddLink}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Add Link"
          >
            <LinkIcon size={18} />
          </button>
          <button
            onClick={onAddImage}
            className="p-2 rounded hover:bg-gray-100"
            title="Add Inline Image"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={onAddCode}
            className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Add Code Block"
          >
            <Code size={18} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Alignment - Note: You'll need to add TextAlign extension for this to work */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {}}
            className="p-2 rounded hover:bg-gray-100 opacity-50 cursor-not-allowed"
            title="Align Left (Extension not loaded)"
          >
            <AlignLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LinkModal = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onSubmit(url, text);
      setUrl('');
      setText('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Link</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text (optional)
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Link text"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeaturedImageUploader = ({ featuredImage, onImageChange, onRemoveImage, altText, onAltTextChange }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    
    // In real implementation, you would upload to your server
    // For now, we'll create a local URL
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl, file.name);
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="mt-6 mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
          <p className="text-sm text-gray-500">
            This image will appear at the top of your post
          </p>
        </div>
        {!featuredImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ImagePlus size={18} />
            Add Featured Image
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {featuredImage ? (
        <div className="relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Preview:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={altText || ''}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Alt text for image"
                className="px-3 py-1 border border-gray-300 rounded text-sm w-64"
                maxLength={125}
              />
              <button
                onClick={onRemoveImage}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-white p-2">
            <img
              src={featuredImage}
              alt={altText || 'Featured'}
              className="w-full h-auto max-h-80 object-contain mx-auto"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Max height: 320px
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Featured images are constrained to max-height: 320px for better editing experience
          </p>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-sm text-gray-600 mb-1">
            {isUploading ? 'Uploading...' : 'Click to upload featured image'}
          </p>
          <p className="text-xs text-gray-500">Recommended: 1200 x 630px (16:9 aspect ratio)</p>
          <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
        </div>
      )}
    </div>
  );
};

const ImageUploadModal = ({ isOpen, onClose, onSubmit, isFeatured = false }) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      onSubmit(imageUrl, alt || file.name);
      setIsUploading(false);
      onClose();
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onSubmit(url, alt);
      setUrl('');
      setAlt('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {isFeatured ? 'Add Featured Image' : 'Add Image'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Image</h4>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Upload className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-sm text-gray-600 mb-1">
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            {!isFeatured && (
              <p className="text-xs text-blue-500 mt-2">
                Click on images in the editor to remove them
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add from URL</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description of the image"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFeatured ? 'Set as Featured' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CodeBlockModal = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code, language, showLineNumbers);
      setCode('');
      setLanguage('javascript');
      onClose();
    }
  };

  const languageOptions = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'html', 'css', 'sql', 'json', 'bash', 'shell'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Add Code Block</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="lineNumbers"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lineNumbers" className="ml-2 text-sm text-gray-700">
                    Show line numbers
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Paste your code here..."
                  spellCheck="false"
                />
                <div className="absolute top-2 right-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {language}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <pre className={`language-${language}`} style={{ margin: 0 }}>
                  <code className={`language-${language}`}>
                    {code || '// Your code will appear here'}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert Code Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CanvasPage = () => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSEOSidebar, setShowSEOSidebar] = useState(false);
  
  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // SEO Data State
  const [seoData, setSeoData] = useState({
    meta_description: '',
    primary_keyword: '',
    secondary_keywords: [],
    canonical_url: '',
    search_intent: 'informational',
    scheduled_publish_at: null,
  });

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Bold,
      Italic,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 transition-colors',
        },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content: '<p>Start writing your post here... You can add images, links, code blocks, and format your text to create a beautiful blog post.</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[70vh] px-0',
      },
    },
    onUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const selectedNode = editor.state.doc.nodeAt(from);
      
      if (selectedNode && selectedNode.type.name === 'image') {
        setSelectedImage({ from, to });
      } else {
        setSelectedImage(null);
      }
    },
  });

  // Helper Functions for Django Data Preparation
  const calculateWordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const calculateReadingTime = (wordCount) => {
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const calculateHeadingCounts = (html) => {
    return {
      h1_count: (html.match(/<h1[^>]*>/gi) || []).length,
      h2_count: (html.match(/<h2[^>]*>/gi) || []).length,
      h3_count: (html.match(/<h3[^>]*>/gi) || []).length,
    };
  };

  const extractInternalLinks = (html) => {
    const links = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const anchorElements = tempDiv.querySelectorAll('a[href^="/"], a[href^="#"]');
    
    anchorElements.forEach(anchor => {
      links.push({
        url: anchor.href,
        text: anchor.textContent,
        target: anchor.target,
      });
    });
    
    return links;
  };

  const generateExcerpt = (html, maxLength = 500) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const prepareBlogData = (status = 'draft') => {
    if (!editor) return null;
    
    const htmlContent = editor.getHTML();
    const wordCount = calculateWordCount(htmlContent);
    const readingTime = calculateReadingTime(wordCount);
    const headingCounts = calculateHeadingCounts(htmlContent);
    const internalLinks = extractInternalLinks(htmlContent);
    
    // Check if featured image is a file or URL
    let featuredImageData = null;
    if (featuredImageFile) {
      // For file upload, you'll need to handle this differently
      // Typically you would upload the file first, then get the URL
      featuredImageData = featuredImageFile;
    } else if (featuredImage) {
      // If it's already a URL
      featuredImageData = featuredImage;
    }
    
    // Prepare the data for Django
    const blogData = {
      title: title.trim(),
      body: htmlContent,
      excerpt: generateExcerpt(htmlContent),
      status: status,
      seo_title: title.substring(0, 60) || title.trim(),
      meta_description: seoData.meta_description || generateExcerpt(htmlContent, 160),
      canonical_url: seoData.canonical_url || '',
      primary_keyword: seoData.primary_keyword || '',
      secondary_keywords: seoData.secondary_keywords || [],
      search_intent: seoData.search_intent || 'informational',
      featured_image: featuredImageData,
      featured_image_alt: featuredImageAlt || seoData.featured_image_alt || '',
      scheduled_publish_at: seoData.scheduled_publish_at || null,
      blog_type: 'blog', // Default, you can add a selector for this
      internal_links: internalLinks,
      // These will be calculated by Django, but we can pre-calculate for frontend feedback
      word_count: wordCount,
      reading_time_minutes: readingTime,
      ...headingCounts,
    };
    
    return blogData;
  };

  // Utility function to get CSRF token
  const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    
    const blogData = prepareBlogData('draft');
    if (!blogData) {
      setIsSaving(false);
      return;
    }
    
    try {
      const response = await fetch('/api/blogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(blogData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Draft saved successfully!');
        localStorage.setItem('currentBlogId', data.id);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to save draft'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please add a title before publishing');
      return;
    }
    
    setIsPublishing(true);
    
    const blogData = prepareBlogData('published');
    if (!blogData) {
      setIsPublishing(false);
      return;
    }
    
    try {
      const response = await fetch('/api/blogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(blogData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Post published successfully!');
        // Optionally redirect to the published post
        // window.location.href = `/blog/${data.slug}/`;
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to publish'}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddLink = useCallback(() => {
    setShowLinkModal(true);
  }, []);

  const handleSubmitLink = useCallback((url, text) => {
    if (editor) {
      if (text) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .run();
      }
    }
  }, [editor]);

  const handleSubmitImage = useCallback((url, alt) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: alt || '' })
        .run();
    }
  }, [editor]);

  const handleSubmitCode = useCallback((code, language, showLineNumbers) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .setCodeBlock({ language })
        .insertContent(code)
        .run();
    }
  }, [editor]);

  const handleRemoveSelectedImage = useCallback(() => {
    if (editor && selectedImage) {
      const { from, to } = selectedImage;
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .run();
      setSelectedImage(null);
    }
  }, [editor, selectedImage]);

  const handleFeaturedImageChange = (imageUrl, fileName) => {
    setFeaturedImage(imageUrl);
    // In a real implementation, you would upload the file to your server
    // and get back a URL. For now, we're using a local URL.
    setFeaturedImageFile(fileName);
  };

  const getPreviewHTML = () => {
    if (!editor) return '';
    return editor.getHTML();
  };

  // Handle click outside to deselect images
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedImage && !event.target.closest('.ProseMirror')) {
        setSelectedImage(null);
        if (editor) {
          editor.chain().blur().run();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedImage, editor]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with actions */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${isPreviewMode ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Eye size={18} />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => setShowSEOSidebar(!showSEOSidebar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${showSEOSidebar ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Search size={18} />
              SEO
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={18} />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto w-full px-4">
        {/* Title input - always visible */}
        <div className="py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your post title..."
            className="w-full text-5xl font-bold placeholder-gray-300 focus:outline-none"
          />
          {!title && (
            <p className="text-sm text-gray-400 mt-2">Add a compelling title for your post</p>
          )}
        </div>

        {/* Featured Image Section */}
        <FeaturedImageUploader
          featuredImage={featuredImage}
          altText={featuredImageAlt}
          onImageChange={handleFeaturedImageChange}
          onRemoveImage={() => {
            setFeaturedImage('');
            setFeaturedImageAlt('');
            setFeaturedImageFile(null);
          }}
          onAltTextChange={setFeaturedImageAlt}
        />

        {isPreviewMode ? (
          // Preview Mode
          <div className="pb-12">
            <div className="prose prose-lg w-full">
              <h1 className="text-5xl font-bold mb-8">{title || 'Untitled'}</h1>
              {featuredImage && (
                <div className="mb-8">
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || 'Featured'}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <div 
                className="prose prose-lg w-full"
                dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
              />
            </div>
          </div>
        ) : (
          // Edit Mode
          <>
            <MenuBar 
              editor={editor} 
              onAddLink={handleAddLink}
              onAddImage={() => setShowImageModal(true)}
              onAddCode={() => setShowCodeModal(true)}
            />
            
            <div className="min-h-[70vh] w-full relative">
              <EditorContent editor={editor} />
              
              {/* Floating remove button for selected images */}
              {selectedImage && (
                <div className="absolute z-20">
                  <button
                    onClick={handleRemoveSelectedImage}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md shadow-lg hover:bg-red-700 transition-colors"
                    style={{
                      position: 'fixed',
                      top: '100px',
                      right: '20px',
                    }}
                  >
                    <X size={16} />
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* SEO Sidebar */}
      <SEOSidebar
        isOpen={showSEOSidebar}
        onClose={() => setShowSEOSidebar(false)}
        title={title}
        body={editor?.getHTML() || ''}
        featuredImageAlt={featuredImageAlt}
        seoData={seoData}
        onSEODataChange={setSeoData}
      />

      {/* Modals */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleSubmitLink}
      />

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSubmit={handleSubmitImage}
      />

      <CodeBlockModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSubmit={handleSubmitCode}
      />

      {/* Floating image helper */}
      {!isPreviewMode && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Image Tips</span>
          </div>
          <p className="text-xs text-gray-500">
            • Click on any image to select it<br/>
            • Click the "Remove Image" button to delete<br/>
            • Images are constrained to max-height: 500px
          </p>
        </div>
      )}
    </div>
  );
};

export default CanvasPage;