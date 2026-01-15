import BackgroundNodeEffect from './components/BackgroundNodeEffect';
import UploadButton from './components/UploadButton';

function App() {
    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-6">
            <BackgroundNodeEffect />



            <main className="z-10 flex flex-col items-center justify-center gap-16 w-full max-w-md animate-fade-in-up">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src="/buildintel-logo.png"
                        alt="BuildIntel"
                        className="h-12 w-auto object-contain drop-shadow-sm"
                    />
                    <h2 className="text-sm font-medium text-white/80 tracking-[0.2em] uppercase">
                        Arbour Square
                    </h2>
                </div>

                <div className="w-full flex justify-center">
                    <UploadButton />
                </div>
            </main>
        </div>
    );
}

export default App;
