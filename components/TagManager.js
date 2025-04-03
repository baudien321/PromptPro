import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, ArrowPathIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const TagManager = ({ tags = [], onRenameTag, onDeleteTag, onMergeTags, isLoading }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [mergeSource, setMergeSource] = useState(null);
  const [mergeTarget, setMergeTarget] = useState(null);
  const [showMergeUI, setShowMergeUI] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState(tags);

  // Sort tags by usage count (descending)
  useEffect(() => {
    // Filter tags based on search query
    const filtered = searchQuery 
      ? tags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : tags;
    
    setFilteredTags(filtered);
    
    // Generate suggested tags based on popularity
    const popular = [...tags]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5)
      .map(tag => tag.name);
    
    setSuggestedTags(popular);
  }, [tags, searchQuery]);

  const handleTagSelect = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleStartEdit = (tagName) => {
    setEditingTag(tagName);
    setNewTagName(tagName);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewTagName('');
  };

  const handleSubmitEdit = () => {
    if (newTagName && newTagName !== editingTag) {
      onRenameTag(editingTag, newTagName);
    }
    setEditingTag(null);
    setNewTagName('');
  };

  const handleDeleteTag = (tagName) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tagName}"? This will remove the tag from all prompts.`)) {
      onDeleteTag(tagName);
    }
  };

  const handleStartMerge = () => {
    if (selectedTags.length < 2) {
      alert('Please select at least 2 tags to merge');
      return;
    }
    setShowMergeUI(true);
    setMergeSource(selectedTags.slice(1));
    setMergeTarget(selectedTags[0]);
  };

  const handleSubmitMerge = () => {
    if (mergeTarget && mergeSource.length > 0) {
      onMergeTags(mergeSource, mergeTarget);
      setShowMergeUI(false);
      setSelectedTags([]);
      setMergeSource(null);
      setMergeTarget(null);
    }
  };

  const handleCancelMerge = () => {
    setShowMergeUI(false);
    setMergeSource(null);
    setMergeTarget(null);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Tag Manager</h2>
        <p className="mt-1 text-sm text-gray-500">
          Organize your prompts by managing tags. Rename, delete, or merge tags to keep your library organized.
        </p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          
          {selectedTags.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={handleStartMerge}
              disabled={selectedTags.length < 2}
            >
              Merge Selected ({selectedTags.length})
            </Button>
          )}
        </div>

        {suggestedTags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 cursor-pointer hover:bg-primary-200"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showMergeUI ? (
        <div className="p-4 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Merge Tags</h3>
          <p className="text-sm text-yellow-700 mb-4">
            All prompts with the source tags will be updated to use the target tag instead.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Tag (keep this tag)
            </label>
            <select
              value={mergeTarget}
              onChange={(e) => setMergeTarget(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {selectedTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Tags (will be replaced)
            </label>
            <div className="bg-white p-2 border border-gray-300 rounded-md min-h-[60px]">
              {selectedTags.filter(tag => tag !== mergeTarget).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center m-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCancelMerge}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitMerge} isLoading={isLoading}>
              Merge Tags
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags(filteredTags.map(tag => tag.name));
                      } else {
                        setSelectedTags([]);
                      }
                    }}
                    checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'No tags match your search' : 'No tags found'}
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => (
                  <tr key={tag.name} className={selectedTags.includes(tag.name) ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        checked={selectedTags.includes(tag.name)}
                        onChange={() => handleTagSelect(tag.name)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTag === tag.name ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSubmitEdit}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tag.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStartEdit(tag.name)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Rename tag"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete tag"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TagManager;