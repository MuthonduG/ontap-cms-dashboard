import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { 
  Save,
  Send,
  Eye,
  Search,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3,
  Code,
  AlignLeft,
  ImagePlus,
  Trash2,
  Upload,
  X,
  Hash,
  Calendar,
  Globe,
  ArrowLeft,
  Clock,
  Star,
  History,
  RefreshCw,
  AlertCircle,
  Check,
  BarChart,
  ExternalLink,
  FileText,
  Settings,
  Type,
  Copy,
  Download
} from 'lucide-react';

// Import highlight.js languages and styles
import 'highlight.js/styles/github-dark.css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('json', json);

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/blogs/api/';

// Helper function to format datetime for HTML input
const formatDateTimeForInput = (datetimeString) => {
  if (!datetimeString) return '';
  
  try {
    const date = new Date(datetimeString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

// Helper function to format datetime for API submission
const formatDateTimeForAPI = (datetimeString) => {
  if (!datetimeString) return null;
  
  try {
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting datetime for API:', error);
    return null;
  }
};

// Enhanced Custom Image extension that handles blob URLs
const CustomImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      'data-original-src': {
        default: null,
      },
      'data-is-blob': {
        default: false,
      },
      'data-filename': {
        default: null,
      },
    };
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title } = HTMLAttributes;
    const isBlob = src && src.startsWith('blob:');
    
    const attributes = {
      ...HTMLAttributes,
      src: isBlob ? '#' : src,
      alt: alt || '',
      title: title || '',
      class: 'blog-image',
      style: 'max-width: 100%; height: auto; border-radius: 4px; margin: 1rem 0;',
    };
    
    if (isBlob) {
      attributes['data-blob-src'] = src;
      attributes['data-loading'] = 'true';
    }
    
    return ['img', attributes];
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
  seoData,
  formData,
  onFormChange,
  originalData
}) => {
  const [localData, setLocalData] = useState({
    meta_description: '',
    primary_keyword: '',
    secondary_keywords: [],
    canonical_url: '',
    search_intent: 'informational',
    featured_image_alt: '',
    ...seoData
  });

  useEffect(() => {
    setLocalData({
      meta_description: formData.meta_description || '',
      primary_keyword: formData.primary_keyword || '',
      secondary_keywords: formData.secondary_keywords || [],
      canonical_url: formData.canonical_url || '',
      search_intent: formData.search_intent || 'informational',
      featured_image_alt: featuredImageAlt || formData.featured_image_alt || '',
      ...seoData
    });
  }, [seoData, featuredImageAlt, formData]);

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onSEODataChange(updated);
    onFormChange(field, value);
  };

  const handleSecondaryKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const updated = { ...localData, secondary_keywords: keywords };
    setLocalData(updated);
    onSEODataChange(updated);
    onFormChange('secondary_keywords', keywords);
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
          
          {originalData?.seo_indicators?.word_count && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Comparison to Original</h4>
              <div className="space-y-1 text-xs">
                {originalData.seo_indicators.word_count && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Word Count:</span>
                    <span className="font-medium">
                      {seoIndicators.word_count > originalData.seo_indicators.word_count ? '↗ Increased' : 
                       seoIndicators.word_count < originalData.seo_indicators.word_count ? '↘ Decreased' : 
                       '✓ Same'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                Schedule Publish (Optional)
              </div>
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_publish_at || ''}
              onChange={(e) => onFormChange('scheduled_publish_at', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Type
            </label>
            <select
              value={formData.blog_type}
              onChange={(e) => onFormChange('blog_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="blog">Blog Post</option>
              <option value="white_paper">White Paper</option>
              <option value="case_study">Case Study</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => onFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => onFormChange('is_featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 flex items-center text-sm text-gray-700">
              <Star size={16} className="mr-1 text-yellow-500" />
              Featured Post
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced MenuBar with image upload
const MenuBar = ({ editor, onAddLink, onAddCode, onUploadImage }) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const imageUrl = URL.createObjectURL(file);
    if (onUploadImage) {
      onUploadImage(imageUrl, file.name, file);
    }
    
    // Reset file input
    event.target.value = '';
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
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
        
        <div className="flex items-center gap-1">
          <button
            onClick={onAddLink}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Add Link"
          >
            <LinkIcon size={18} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
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
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Featured Image Uploader
const FeaturedImageUploader = ({ featuredImage, onImageChange, onRemoveImage, altText, onAltTextChange, originalAltText }) => {
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
    
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl, file.name, file);
      setIsUploading(false);
    }, 1000);
  };

  const hasChanges = altText !== originalAltText || featuredImage;

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
            {originalAltText ? 'Change Featured Image' : 'Add Featured Image'}
          </button>
        )}
        {hasChanges && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Modified
          </span>
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
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

// Image Toolbar
const ImageToolbar = ({ selectedImage, onRemove, onUpdateAlt }) => {
  const [altText, setAltText] = useState(selectedImage?.alt || '');

  if (!selectedImage) return null;

  return (
    <div className="fixed top-20 right-6 z-30 bg-white rounded-lg shadow-lg p-4 border border-gray-300 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Image Options</h4>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-50 rounded text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={() => onUpdateAlt && onUpdateAlt(altText)}
            placeholder="Describe this image"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
              <Copy size={12} className="inline mr-1" />
              Copy URL
            </button>
            <button className="flex-1 px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
              <Download size={12} className="inline mr-1" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showLinkModal, setShowLinkModal] = useState(false);
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
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [blobImages, setBlobImages] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    excerpt: '',
    blog_type: 'blog',
    status: 'draft',
    seo_title: '',
    meta_description: '',
    primary_keyword: '',
    secondary_keywords: [],
    search_intent: 'informational',
    featured_image_alt: '',
    internal_links: [],
    scheduled_publish_at: '',
    is_featured: false,
    canonical_url: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[70vh] px-0',
      },
    },
    onUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const selectedNode = editor.state.doc.nodeAt(from);
      
      if (selectedNode && selectedNode.type.name === 'image') {
        setSelectedImage({ 
          from, 
          to, 
          node: selectedNode,
          src: selectedNode.attrs.src,
          alt: selectedNode.attrs.alt 
        });
      } else {
        setSelectedImage(null);
      }
    },
    onPaste: (view, event) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find(item => item.type.startsWith('image'));
      
      if (imageItem) {
        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          editor
            .chain()
            .focus()
            .setImage({ src: imageUrl, alt: 'Pasted image', 'data-filename': 'pasted-image.png' })
            .run();
        }
      }
    },
  });

  // Load blog data
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        const response = await fetch(`${API_BASE_URL}blogs/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const blogData = data.blog;
        
        console.log('Blog data loaded:', blogData);
        
        setBlogData(blogData);
        setOriginalData(blogData);
        
        // Set form data
        setTitle(blogData.title || '');
        
        const formattedScheduledDate = blogData.scheduled_publish_at 
          ? formatDateTimeForInput(blogData.scheduled_publish_at)
          : '';
        
        setFormData({
          excerpt: blogData.excerpt || '',
          blog_type: blogData.blog_type || 'blog',
          status: blogData.status || 'draft',
          seo_title: blogData.seo_title || '',
          meta_description: blogData.meta_description || '',
          primary_keyword: blogData.primary_keyword || '',
          secondary_keywords: blogData.secondary_keywords || [],
          search_intent: blogData.search_intent || 'informational',
          featured_image_alt: blogData.featured_image_alt || '',
          internal_links: blogData.internal_links || [],
          scheduled_publish_at: formattedScheduledDate,
          is_featured: blogData.is_featured || false,
          canonical_url: blogData.canonical_url || '',
        });

        // Set featured image
        if (blogData.image_url) {
          setFeaturedImage(blogData.image_url);
        } else if (blogData.featured_image) {
          setFeaturedImage(blogData.featured_image);
        }
        setFeaturedImageAlt(blogData.featured_image_alt || '');

        // Set editor content - IMPORTANT: Process images to handle blob URLs
        if (editor && blogData.body) {
          // Clean up blob URLs from previous sessions
          let processedBody = blogData.body;
          
          // Replace blob URLs with placeholder
          const blobRegex = /src="(blob:[^"]+)"/g;
          processedBody = processedBody.replace(blobRegex, 'src="#" data-missing-image="true"');
          
          // Also handle images with blob: in other attributes
          processedBody = processedBody.replace(/blob:[^"'\s]+/g, '#');
          
          editor.commands.setContent(processedBody);
        }

        setVersionHistory([
          {
            id: 1,
            version: '2.0',
            date: blogData.updated_at || new Date().toISOString(),
            author: blogData.author_name || blogData.user?.first_name + ' ' + blogData.user?.last_name || 'Unknown',
            changes: ['Updated content', 'Added new sections', 'Fixed typos'],
            content: blogData.body || ''
          },
          {
            id: 2,
            version: '1.0',
            date: blogData.created_at || new Date().toISOString(),
            author: blogData.author_name || blogData.user?.first_name + ' ' + blogData.user?.last_name || 'Unknown',
            changes: ['Initial draft'],
            content: blogData.body || ''
          }
        ]);
        
      } catch (error) {
        console.error('Error loading blog data:', error);
        setApiError(error.message || 'Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlogData();
    }
  }, [id, editor]);

  // Extract blob images from editor content
  const extractBlobImages = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = Array.from(doc.querySelectorAll('img[src^="blob:"]'));
    
    return images.map(img => ({
      src: img.src,
      alt: img.alt || '',
      element: img
    }));
  };

  // Process images before save
  const processImagesForSave = async (html) => {
    const blobImages = extractBlobImages(html);
    let processedHtml = html;
    
    for (const img of blobImages) {
      const match = img.src.match(/blob:(.+)/);
      if (match) {
        try {
          // Convert blob to base64 for upload
          const response = await fetch(img.src);
          const blob = await response.blob();
          
          // Create a new file from blob
          const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
          
          // Replace blob URL with placeholder
          processedHtml = processedHtml.replace(
            new RegExp(`src="${img.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            'src="#" data-temp-image="true"'
          );
          
          // Store blob image for upload
          setBlobImages(prev => [...prev, { file, alt: img.alt }]);
        } catch (error) {
          console.error('Error processing blob image:', error);
        }
      }
    }
    
    return processedHtml;
  };

  // Helper functions
  const handleFormChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
    if (successMessage) setSuccessMessage(null);
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

  const handleUploadImage = useCallback((imageUrl, fileName, file) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrl, alt: fileName, 'data-filename': fileName })
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

  const handleUpdateImageAlt = useCallback((altText) => {
    if (editor && selectedImage) {
      const { from, to } = selectedImage;
      editor
        .chain()
        .focus()
        .setImage({ alt: altText })
        .run();
    }
  }, [editor, selectedImage]);

  const handleFeaturedImageChange = (imageUrl, fileName, file) => {
    setFeaturedImage(imageUrl);
    setFeaturedImageFile(file);
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage('');
    setFeaturedImageAlt('');
    setFeaturedImageFile(null);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 200) newErrors.title = 'Title should be less than 200 characters';
    
    const body = editor?.getHTML() || '';
    if (!body.trim() || body === '<p></p>') newErrors.body = 'Content is required';
    
    if (formData.status === 'scheduled' && !formData.scheduled_publish_at) {
      newErrors.scheduled_publish_at = 'Scheduled publish date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // Format data for API
  const formatDataForApi = async (status) => {
    const rawBody = editor?.getHTML() || '';
    
    // Process images before saving
    const processedBody = await processImagesForSave(rawBody);
    
    const data = {
      title: title,
      excerpt: formData.excerpt || generateExcerpt(processedBody),
      body: processedBody,
      blog_type: formData.blog_type,
      status: status || formData.status,
      seo_title: formData.seo_title || title.substring(0, 60),
      meta_description: formData.meta_description || generateExcerpt(processedBody, 160),
      primary_keyword: formData.primary_keyword || '',
      secondary_keywords: formData.secondary_keywords || [],
      search_intent: formData.search_intent,
      featured_image_alt: formData.featured_image_alt || featuredImageAlt || '',
      internal_links: formData.internal_links || [],
      is_featured: formData.is_featured || false,
      canonical_url: formData.canonical_url || '',
    };

    if (formData.scheduled_publish_at) {
      const formattedDate = formatDateTimeForAPI(formData.scheduled_publish_at);
      if (formattedDate) {
        data.scheduled_publish_at = formattedDate;
      }
    }

    return data;
  };

  // Helper function to generate excerpt
  const generateExcerpt = (html, maxLength = 500) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // API call to update blog
  const updateBlog = async (status) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const apiData = await formatDataForApi(status);
      console.log('📤 Updating blog with data:', apiData);

      // Create FormData
      const formDataObj = new FormData();
      
      // Append text fields
      formDataObj.append('title', apiData.title);
      formDataObj.append('excerpt', apiData.excerpt);
      formDataObj.append('body', apiData.body);
      formDataObj.append('blog_type', apiData.blog_type);
      formDataObj.append('status', apiData.status);
      formDataObj.append('seo_title', apiData.seo_title || '');
      formDataObj.append('meta_description', apiData.meta_description || '');
      formDataObj.append('primary_keyword', apiData.primary_keyword || '');
      formDataObj.append('canonical_url', apiData.canonical_url || '');
      formDataObj.append('search_intent', apiData.search_intent);
      formDataObj.append('featured_image_alt', apiData.featured_image_alt || '');
      formDataObj.append('is_featured', apiData.is_featured);
      
      // Handle array fields
      if (apiData.secondary_keywords && apiData.secondary_keywords.length > 0) {
        formDataObj.append('secondary_keywords', JSON.stringify(apiData.secondary_keywords));
      } else {
        formDataObj.append('secondary_keywords', JSON.stringify([]));
      }
      
      if (apiData.internal_links && apiData.internal_links.length > 0) {
        formDataObj.append('internal_links', JSON.stringify(apiData.internal_links));
      } else {
        formDataObj.append('internal_links', JSON.stringify([]));
      }
      
      // Handle scheduled date
      if (apiData.scheduled_publish_at) {
        formDataObj.append('scheduled_publish_at', apiData.scheduled_publish_at);
      }
      
      // Append featured image file if exists
      if (featuredImageFile) {
        formDataObj.append('featured_image', featuredImageFile);
      } else if (!featuredImage && featuredImageFile === null && originalData?.featured_image) {
        // If image was removed
        formDataObj.append('featured_image', '');
      }

      // Append blob images as additional images
      for (let i = 0; i < blobImages.length; i++) {
        const img = blobImages[i];
        formDataObj.append(`images[${i}]`, img.file);
      }

      const response = await fetch(`${API_BASE_URL}blogs/${id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      console.log('📥 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ API error response:', data);
        
        if (response.status === 400) {
          let errorMessage = 'Validation failed';
          if (data.errors) {
            const errorMessages = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = `Validation errors:\n${errorMessages}`;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.detail) {
            errorMessage = data.detail;
          }
          throw new Error(errorMessage);
        }
        
        throw new Error(data.error || data.message || data.detail || `HTTP ${response.status}: Failed to update blog`);
      }

      console.log('✅ Blog updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error updating blog:', error);
      throw error;
    }
  };

  // Save handlers
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await updateBlog('draft');
      setSuccessMessage('Draft updated successfully!');
      
      // Clear blob images after successful save
      setBlobImages([]);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Failed to update draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before publishing');
      return;
    }

    setIsPublishing(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await updateBlog('published');
      setSuccessMessage('Blog published successfully! Redirecting...');
      
      // Clear blob images after successful save
      setBlobImages([]);
      
      setTimeout(() => {
        navigate('/dashboard/cms_crud/view_blogs');
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Failed to publish blog');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!validateForm()) {
      setApiError('Please fix the errors before scheduling');
      return;
    }

    if (!formData.scheduled_publish_at) {
      setApiError('Please select a scheduled publish date');
      return;
    }

    const scheduledDate = new Date(formData.scheduled_publish_at);
    if (scheduledDate <= new Date()) {
      setApiError('Scheduled publish date must be in the future');
      return;
    }

    setIsPublishing(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await updateBlog('scheduled');
      setSuccessMessage('Blog scheduled successfully! Redirecting...');
      
      // Clear blob images after successful save
      setBlobImages([]);
      
      setTimeout(() => {
        navigate('/dashboard/cms_crud/view_blogs');
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Failed to schedule blog');
    } finally {
      setIsPublishing(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    
    const currentBody = editor?.getHTML() || '';
    const originalScheduledDate = originalData.scheduled_publish_at 
      ? formatDateTimeForInput(originalData.scheduled_publish_at)
      : '';
    
    const arraysEqual = (a, b) => {
      if (!Array.isArray(a) && !Array.isArray(b)) return a === b;
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      if (a.length !== b.length) return false;
      return JSON.stringify(a.sort()) === JSON.stringify(b.sort());
    };
    
    return (
      title !== originalData.title ||
      formData.excerpt !== originalData.excerpt ||
      currentBody !== originalData.body ||
      formData.blog_type !== originalData.blog_type ||
      formData.status !== originalData.status ||
      formData.seo_title !== originalData.seo_title ||
      formData.meta_description !== originalData.meta_description ||
      formData.primary_keyword !== originalData.primary_keyword ||
      !arraysEqual(formData.secondary_keywords, originalData.secondary_keywords) ||
      formData.search_intent !== originalData.search_intent ||
      featuredImageAlt !== originalData.featured_image_alt ||
      formData.scheduled_publish_at !== originalScheduledDate ||
      formData.is_featured !== originalData.is_featured ||
      formData.canonical_url !== originalData.canonical_url ||
      !!featuredImageFile ||
      blobImages.length > 0
    );
  };

  // Reset form to original data
  const resetFormData = () => {
    if (window.confirm('Reset all changes?')) {
      const formattedScheduledDate = originalData?.scheduled_publish_at 
        ? formatDateTimeForInput(originalData.scheduled_publish_at)
        : '';
      
      setTitle(originalData?.title || '');
      setFormData({
        excerpt: originalData?.excerpt || '',
        blog_type: originalData?.blog_type || 'blog',
        status: originalData?.status || 'draft',
        seo_title: originalData?.seo_title || '',
        meta_description: originalData?.meta_description || '',
        primary_keyword: originalData?.primary_keyword || '',
        secondary_keywords: originalData?.secondary_keywords || [],
        search_intent: originalData?.search_intent || 'informational',
        featured_image_alt: originalData?.featured_image_alt || '',
        internal_links: originalData?.internal_links || [],
        scheduled_publish_at: formattedScheduledDate,
        is_featured: originalData?.is_featured || false,
        canonical_url: originalData?.canonical_url || '',
      });
      
      if (originalData?.image_url) {
        setFeaturedImage(originalData.image_url);
      } else if (originalData?.featured_image) {
        setFeaturedImage(originalData.featured_image);
      }
      setFeaturedImageAlt(originalData?.featured_image_alt || '');
      setFeaturedImageFile(null);
      setBlobImages([]);
      
      if (editor && originalData?.body) {
        // Clean blob URLs from body
        let cleanedBody = originalData.body;
        cleanedBody = cleanedBody.replace(/src="blob:[^"]+"/g, 'src="#"');
        editor.commands.setContent(cleanedBody);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && !blogData && !loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <h2 className="text-xl font-bold text-red-800">Failed to Load Blog</h2>
                <p className="text-red-600 mt-2">{apiError}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate('/dashboard/cms_crud/view_blogs')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Back to Blog List
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/cms_crud/view_blogs')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            {blogData?.slug && (
              <a
                href={`/blog/${blogData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <ExternalLink size={18} />
                View Live
              </a>
            )}
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
              SEO & Settings
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <History size={18} />
              History
            </button>
            {hasChanges() && (
              <button
                onClick={resetFormData}
                className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-md"
              >
                <RefreshCw size={18} />
                Reset
              </button>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || !hasChanges()}
              className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            {formData.status === 'scheduled' || formData.status === 'draft' ? (
              <button
                onClick={handleSchedule}
                disabled={isPublishing || !hasChanges()}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Clock size={18} />
                {isPublishing ? 'Scheduling...' : 'Schedule'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing || !hasChanges()}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Send size={18} />
                {isPublishing ? 'Publishing...' : 'Publish Update'}
              </button>
            )}
          </div>
        </div>
      </header>

      {(apiError || successMessage) && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <p className="text-sm text-red-800">{apiError}</p>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="ml-auto text-sm text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {blogData && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Blog Information</h3>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-gray-500 w-20">ID:</span>
                    <span className="font-medium">#{blogData.id}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-20">Slug:</span>
                    <span className="font-medium">{blogData.slug}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-20">Views:</span>
                    <span className="font-medium text-blue-600">{blogData.view_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Timeline</h3>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-gray-500 w-24">Created:</span>
                    <span className="font-medium">{formatDate(blogData.created_at)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Updated:</span>
                    <span className="font-medium">{formatDate(blogData.updated_at)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Published:</span>
                    <span className="font-medium">{formatDate(blogData.published_at)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    formData.status === 'published' ? 'bg-green-100 text-green-800' :
                    formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    formData.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                  </span>
                  {formData.status === 'scheduled' && formData.scheduled_publish_at && (
                    <span className="ml-2 text-xs text-gray-600">
                      {formatDate(formData.scheduled_publish_at)}
                    </span>
                  )}
                </div>
                {hasChanges() && (
                  <div className="mt-3">
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle size={14} className="mr-1" />
                      <span>You have unsaved changes</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto w-full px-4">
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
          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <FeaturedImageUploader
          featuredImage={featuredImage}
          altText={featuredImageAlt}
          originalAltText={originalData?.featured_image_alt || ''}
          onImageChange={handleFeaturedImageChange}
          onRemoveImage={handleRemoveFeaturedImage}
          onAltTextChange={(value) => {
            setFeaturedImageAlt(value);
            handleFormChange('featured_image_alt', value);
          }}
        />

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (Optional)
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleFormChange('excerpt', e.target.value)}
            rows="3"
            placeholder="Write a short summary of your blog post"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            If not provided, an excerpt will be generated from the content
          </p>
        </div>

        {isPreviewMode ? (
          <div className="pb-12">
            <div className="prose prose-lg w-full">
              <h1 className="text-5xl font-bold mb-8">{title || 'Untitled'}</h1>
              {featuredImage && (
                <div className="mb-8">
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || 'Featured'}
                    className="w-full h-auto rounded-lg max-h-[500px] object-contain"
                  />
                </div>
              )}
              <div 
                className="prose prose-lg w-full"
                dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
              />
            </div>
          </div>
        ) : (
          <>
            <MenuBar 
              editor={editor} 
              onAddLink={handleAddLink}
              onAddCode={() => setShowCodeModal(true)}
              onUploadImage={handleUploadImage}
            />
            
            <div className="min-h-[70vh] w-full relative">
              <EditorContent editor={editor} />
              
              <ImageToolbar
                selectedImage={selectedImage}
                onRemove={handleRemoveSelectedImage}
                onUpdateAlt={handleUpdateImageAlt}
              />
            </div>
          </>
        )}
      </main>

      <SEOSidebar
        isOpen={showSEOSidebar}
        onClose={() => setShowSEOSidebar(false)}
        title={title}
        body={editor?.getHTML() || ''}
        featuredImageAlt={featuredImageAlt}
        formData={formData}
        originalData={originalData}
        onFormChange={handleFormChange}
      />

      {blobImages.length > 0 && (
        <div className="fixed bottom-6 left-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">
              {blobImages.length} image(s) to upload
            </span>
          </div>
          <p className="text-xs text-yellow-600">
            These images will be uploaded when you save the blog post
          </p>
        </div>
      )}

      {!isPreviewMode && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Image Tips</span>
          </div>
          <p className="text-xs text-gray-500">
            • Click on any image to select it<br/>
            • Drag & drop images directly into the editor<br/>
            • Images are automatically optimized
          </p>
        </div>
      )}
    </div>
  );
};

export default UpdateBlogPage;