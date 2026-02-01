import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { csatAPI } from '../../api/csat';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiDownload, FiFile } from 'react-icons/fi';

function UploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [period, setPeriod] = useState('');
  const [periodType, setPeriodType] = useState('quarterly');
  const [organization, setOrganization] = useState('');
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: (data) => csatAPI.uploadData(data.file, data.metadata),
    onSuccess: (response) => {
      toast.success(`CSAT data uploaded successfully! ${response.data.alerts || 0} alerts generated.`);
      queryClient.invalidateQueries(['csat-metrics']);
      queryClient.invalidateQueries(['csat-alerts']);
      onClose();
      setFile(null);
      setPeriod('');
      setOrganization('');
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.response?.data?.error || err.message}`);
    }
  });
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx)$/i)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
    }
  };
  
  const handleUpload = () => {
    if (!file || !period) {
      toast.error('Please select a file and enter period');
      return;
    }
    
    // Validate period format
    if (periodType === 'quarterly' && !/^\d{4}-Q[1-4]$/.test(period)) {
      toast.error('Period must be in format: YYYY-Q# (e.g., 2026-Q1)');
      return;
    }
    
    if (periodType === 'monthly' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      toast.error('Period must be in format: YYYY-MM (e.g., 2026-01)');
      return;
    }
    
    uploadMutation.mutate({
      file,
      metadata: { 
        period, 
        periodType, 
        dataSource: 'manual_upload',
        organization: organization || undefined
      }
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload CSAT/NPS Data</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={periodType === 'quarterly' ? 'e.g., 2026-Q1' : 'e.g., 2026-01'}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {periodType === 'quarterly' 
                ? 'Format: YYYY-Q# (e.g., 2026-Q1)'
                : 'Format: YYYY-MM (e.g., 2026-01)'}
            </p>
          </div>
          
          {/* Period Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Type <span className="text-red-500">*</span>
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="input w-full"
            >
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          {/* Organization (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., GXS, GXB, Superbank"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if data includes multiple organizations
            </p>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data File (CSV or Excel) <span className="text-red-500">*</span>
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FiFile className="w-6 h-6 text-primary-600" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    CSV or Excel files only
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* File Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Expected CSV Format:</h4>
            <div className="text-xs text-blue-800 font-mono bg-white p-2 rounded border border-blue-200 overflow-x-auto">
              period, organization, dimension, product, score, responses, survey_question, verbatim
            </div>
            <p className="text-xs text-blue-700 mt-2">
              See documentation for detailed column descriptions
            </p>
          </div>
          
          {/* Template Download */}
          <div className="text-sm">
            <a 
              href="/templates/csat-upload-template.csv"
              download
              className="flex items-center gap-1 text-primary-600 hover:text-primary-800 hover:underline"
            >
              <FiDownload className="w-4 h-4" />
              Download CSV Template
            </a>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !file || !period}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                <>
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;

