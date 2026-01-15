import { useState, useRef, useEffect } from 'react';
import { Upload, Check, AlertTriangle } from 'lucide-react';

const BATCH_SIZE = 5;

interface QueueItem {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

const UploadButton = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<QueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completeState, setCompleteState] = useState(false);

    const totalFiles = items.length;
    const completedCount = items.filter(i => i.status === 'completed').length;
    const errorCount = items.filter(i => i.status === 'error').length;
    const isUploading = items.some(i => i.status === 'pending' || i.status === 'uploading');
    const hasErrors = errorCount > 0;

    const handleClick = () => {
        if (isUploading || completeState) return;
        if (hasErrors) {
            // Allow retry or reset on click if error
            setItems([]);
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const newItems: QueueItem[] = Array.from(files).map(file => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending'
            }));
            setItems(newItems);
            setIsProcessing(true);

            // Reset input value to allow re-selection of same files if needed later
            event.target.value = '';
        }
    };

    // Process Queue Effect
    useEffect(() => {
        if (!isProcessing) return;

        // Stop processing if all handled
        const pendingOrUploading = items.filter(i => i.status === 'pending' || i.status === 'uploading').length;

        if (pendingOrUploading === 0 && totalFiles > 0) {
            setIsProcessing(false);

            // Only show success if NO errors
            if (errorCount === 0) {
                setCompleteState(true);
                setTimeout(() => {
                    setCompleteState(false);
                    setItems([]);
                }, 3000);
            }
            return;
        }

        const processQueue = async () => {
            const activeUploads = items.filter(i => i.status === 'uploading').length;
            const pendingItems = items.filter(i => i.status === 'pending');

            if (activeUploads < BATCH_SIZE && pendingItems.length > 0) {
                const slotsAvailable = BATCH_SIZE - activeUploads;
                const toUpload = pendingItems.slice(0, slotsAvailable);

                setItems(current =>
                    current.map(item =>
                        toUpload.find(u => u.id === item.id)
                            ? { ...item, status: 'uploading' }
                            : item
                    )
                );

                // Trigger uploads for new batch
                toUpload.forEach(item => uploadFile(item));
            }
        };

        processQueue();
    }, [items, isProcessing, totalFiles, errorCount]);

    const uploadFile = async (item: QueueItem) => {
        const formData = new FormData();
        // Server expects 'photos' as the field name now
        formData.append('photos', item.file);

        try {
            // Server is now on port 3000 and route is /upload
            const response = await fetch('https://arbour-square-upload.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            // Server returns { success: true, files: [...] }
            if (!result.success) {
                throw new Error('Server returned failure');
            }

            setItems(current =>
                current.map(i => i.id === item.id ? { ...i, status: 'completed' } : i)
            );
        } catch (error) {
            console.error("Upload error", error);
            setItems(current =>
                current.map(i => i.id === item.id ? { ...i, status: 'error' } : i)
            );
        }
    };

    // Dynamic Styles
    const baseClasses = "group relative flex items-center justify-center gap-3 font-medium text-lg rounded-xl px-8 py-4 shadow-lg min-h-[50px] w-full max-w-xs transition-all duration-300 backdrop-blur-md border";

    let stateClasses = "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 active:scale-95 hover:shadow-xl";
    let content = (
        <>
            <Upload className="w-5 h-5 stroke-2" />
            <span className="tracking-wide">Upload SmartSort™</span>
        </>
    );

    if (isUploading) {
        stateClasses = "bg-white/10 border-white/30 text-white cursor-wait";
        content = (
            <span className="tracking-wide animate-pulse">
                Uploading... ({completedCount}/{totalFiles})
            </span>
        );
    } else if (hasErrors) {
        stateClasses = "bg-red-500/20 border-red-400 text-red-100 hover:scale-105";
        content = (
            <>
                <AlertTriangle className="w-5 h-5 stroke-2" />
                <span className="tracking-wide">Upload Failed (Retry)</span>
            </>
        );
    } else if (completeState) {
        stateClasses = "bg-green-500/20 border-green-400 text-green-100 hover:scale-105";
        content = (
            <>
                <Check className="w-5 h-5 stroke-2" />
                <span className="tracking-wide">Upload Complete</span>
            </>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
            />
            <button
                onClick={handleClick}
                disabled={isUploading}
                className={`${baseClasses} ${stateClasses} overflow-hidden`}
                aria-label="Upload SmartSort"
            >
                {/* Progress Bar Background */}
                {isUploading && (
                    <div
                        className="absolute left-0 bottom-0 h-full bg-white/20 transition-all duration-300 ease-out"
                        style={{ width: `${(completedCount / totalFiles) * 100}%` }}
                    />
                )}

                <div className="relative flex items-center gap-3 z-10">
                    {content}
                </div>
            </button>
        </div>
    );
};

export default UploadButton;
