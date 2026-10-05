import React, { useState } from 'react';
import {
  HardDrive,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  Lock,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { D1Media } from '../types';

interface R2StorageViewProps {
  mediaList: D1Media[];
  setMediaList: React.Dispatch<React.SetStateAction<D1Media[]>>;
}

export const R2StorageView: React.FC<R2StorageViewProps> = ({
  mediaList,
  setMediaList
}) => {
  const [selectedFileForPresign, setSelectedFileForPresign] = useState<D1Media | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [presignDuration, setPresignDuration] = useState('3600');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadSizeKb, setUploadSizeKb] = useState(350);
  const [uploadVisibility, setUploadVisibility] = useState<'public' | 'private'>('public');

  const totalBytes = mediaList.reduce((acc, curr) => acc + curr.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const freeTierLimitMb = 10 * 1024; // 10 GB = 10240 MB
  const percentUsed = ((Number(totalMb) / freeTierLimitMb) * 100).toFixed(3);

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, visibility: m.visibility === 'public' ? 'private' : 'public' }
          : m
      )
    );
  };

  const handleGeneratePresignedUrl = (file: D1Media) => {
    setSelectedFileForPresign(file);
    const expiresAt = new Date(Date.now() + Number(presignDuration) * 1000).toISOString();
    const token = Math.random().toString(36).substring(2, 15);
    setPresignedUrl(
      `https://r2.cerebrocentral.com/${file.filename}?X-Amz-Signature=${token}&Expires=${expiresAt}`
    );
  };

  const handleUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilename.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const ext = uploadFilename.split('.').pop() || 'dat';
      let mime = 'application/octet-stream';
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) mime = `image/${ext}`;
      if (['pdf'].includes(ext)) mime = 'application/pdf';
      if (['json'].includes(ext)) mime = 'application/json';

      const newMedia: D1Media = {
        id: `media_${Math.random().toString(36).substring(2, 7)}`,
        organization_id: '',
        uploaded_by: '',
        filename: uploadFilename,
        mime_type: mime,
        size: uploadSizeKb * 1024,
        storage_path: `uploads/${uploadFilename}`,
        r2_key: `cerebrocentral/media/${uploadFilename}`,
        visibility: uploadVisibility,
        created_at: new Date().toISOString()
      };

      setMediaList((prev) => [newMedia, ...prev]);
      setIsUploading(false);
      setUploadFilename('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Cloudflare R2 Object Storage</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
              bucket: cerebrocentral
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            S3-compatible object storage at the edge with 10 GB free monthly tier and ZERO egress fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">R2 Free Allocation</div>
            <div className="text-sm font-semibold font-mono text-emerald-400">
              {totalMb} MB / 10,240 MB ({percentUsed}%)
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.max(Number(percentUsed), 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* R2 Advantage Callout */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-200 leading-relaxed">
          <span className="font-semibold text-purple-300">Zero Egress Bandwidth Advantage:</span> Unlike
          Amazon S3 which bills $0.09 per GB of outbound bandwidth, Cloudflare R2 has $0 egress fees.
          Assets served on <code className="text-purple-300">r2.cerebrocentral.com</code> stream
          directly to users around the globe at zero bandwidth charge.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-purple-400" />
            <span>Upload Object to R2</span>
          </h3>

          <form onSubmit={handleUploadSimulate} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">File Name</label>
              <input
                type="text"
                placeholder="e.g. app-banner-v2.png"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Simulated Size (KB)</label>
                <input
                  type="number"
                  value={uploadSizeKb}
                  onChange={(e) => setUploadSizeKb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono"
                  min={1}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Visibility</label>
                <select
                  value={uploadVisibility}
                  onChange={(e) => setUploadVisibility(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="public">Public (CDN)</option>
                  <option value="private">Private (Signed)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !uploadFilename}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Streaming to R2...' : 'Simulate R2 PutObject'}</span>
            </button>
          </form>

          {/* R2 Bucket Specs */}
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Binding:</span>
              <span className="text-slate-200">env.BUCKET</span>
            </div>
            <div className="flex justify-between">
              <span>Public Domain:</span>
              <span className="text-purple-400">r2.cerebrocentral.com</span>
            </div>
            <div className="flex justify-between">
              <span>Total Files:</span>
              <span className="text-slate-200 tabular-nums">{mediaList.length}</span>
            </div>
          </div>
        </div>

        {/* Object Files Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Objects in Bucket ({mediaList.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">r2://cerebrocentral/*</span>
          </div>

          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg overflow-hidden">
            {mediaList.map((file) => {
              const fileUrl = `https://r2.cerebrocentral.com/${file.filename}`;
              const isImage = file.mime_type.startsWith('image/');

              return (
                <div
                  key={file.id}
                  className="p-3.5 bg-slate-950/40 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                      {isImage ? (
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="font-mono font-medium text-slate-200 truncate">
                        {file.filename}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span>·</span>
                        <span>{file.mime_type}</span>
                        <span>·</span>
                        <span className="truncate max-w-[140px] text-slate-500">{file.r2_key}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleVisibility(file.id)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border flex items-center gap-1 transition-colors ${
                        file.visibility === 'public'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Toggle Public / Private"
                    >
                      {file.visibility === 'public' ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyUrl(fileUrl, file.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                      title="Copy URL"
                    >
                      {copiedKey === file.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleGeneratePresignedUrl(file)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-mono"
                      title="Generate Presigned URL"
                    >
                      Presign
                    </button>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded transition-colors"
                      title="Delete Object"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Presigned URL Modal */}
      {selectedFileForPresign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-semibold text-white">Generate R2 Presigned URL</h3>
            <p className="text-xs text-slate-400">
              Presigned URLs grant temporary authenticated read/write access to private R2 objects
              without exposing credentials.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Object</label>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
                  {selectedFileForPresign.filename}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Validity Duration</label>
                <select
                  value={presignDuration}
                  onChange={(e) => {
                    setPresignDuration(e.target.value);
                    const expiresAt = new Date(Date.now() + Number(e.target.value) * 1000).toISOString();
                    setPresignedUrl(
                      `https://r2.cerebrocentral.com/${selectedFileForPresign.filename}?X-Amz-Signature=sig_${Math.random()
                        .toString(36)
                        .substring(2, 10)}&Expires=${expiresAt}`
                    );
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="3600">1 Hour (3,600s)</option>
                  <option value="86400">24 Hours (86,400s)</option>
                  <option value="604800">7 Days (604,800s)</option>
                </select>
              </div>

              {presignedUrl && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Generated Presigned URL</label>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
                    {presignedUrl}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedFileForPresign(null);
                  setPresignedUrl(null);
                }}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              {presignedUrl && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(presignedUrl);
                    setCopiedKey('presign');
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5"
                >
                  {copiedKey === 'presign' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy URL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
