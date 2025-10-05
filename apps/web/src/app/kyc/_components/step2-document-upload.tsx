'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';

const documentUploadSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: z.string().min(1, 'Document number is required'),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface Step2DocumentUploadProps {
  initialData?: Partial<DocumentUploadFormData>;
  personalInfo: any;
  onBack: () => void;
  onSubmit: (data: DocumentUploadFormData, file: File) => Promise<void>;
}

export function Step2DocumentUpload({ initialData, personalInfo, onBack, onSubmit }: Step2DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: initialData,
  });

  const documentType = watch('documentType');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(selectedFile.type)) {
      setError('File must be JPEG, PNG, or PDF');
      return;
    }

    setError(null);
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFormSubmit = async (data: DocumentUploadFormData) => {
    if (!file) {
      setError('Please upload a document');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await onSubmit(data, file);
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC application');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Identity Verification</h4>
        <p className="text-sm text-blue-700">
          Please upload a clear photo or scan of your government-issued ID. Accepted documents include passport, driver's license, or national ID card.
        </p>
      </div>

      <div>
        <Label htmlFor="documentType">Document Type *</Label>
        <Select
          value={documentType}
          onValueChange={(value) => setValue('documentType', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PASSPORT">Passport</SelectItem>
            <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
            <SelectItem value="NATIONAL_ID">National ID Card</SelectItem>
          </SelectContent>
        </Select>
        {errors.documentType && (
          <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="documentNumber">Document Number *</Label>
        <Input
          id="documentNumber"
          {...register('documentNumber')}
          placeholder="Enter document number"
          className="mt-2"
        />
        {errors.documentNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="document">Upload Document *</Label>
        <div className="mt-2">
          <input
            id="document"
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="document"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
          >
            {file ? (
              <div className="flex flex-col items-center">
                {preview ? (
                  <img src={preview} alt="Document preview" className="max-h-32 rounded" />
                ) : (
                  <FileText className="h-12 w-12 text-gray-400" />
                )}
                <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="mt-1 text-xs text-primary">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">Click to upload</p>
                <p className="text-xs text-gray-500">JPEG, PNG or PDF (max 10MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={uploading} className="flex-1">
          Back
        </Button>
        <Button type="submit" disabled={uploading || !file} className="flex-1">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
