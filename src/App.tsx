import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Effect, pipe } from "effect";

// 타입 정의
type ImageSize = { width: number; height: number };
type FileStatus =
    | { _tag: "NotSelected" }
    | { _tag: "NotImage" }
    | { _tag: "FileError" }
    | { _tag: "Selected"; size: ImageSize };

// 파일 읽기 오류 클래스
class ErrorOfReadingFile {
    readonly _tag = "ErrorOfReadingFile";
}

// 이미지 로드 오류 클래스
class ErrorOfLoadingImage {
    readonly _tag = "ErrorOfLoadingImage";
}

// 파일을 읽어서 데이터 URL을 반환하는 함수
const readFile = (file: File) =>
    Effect.tryPromise({
        try: () => {
            const reader = new FileReader();
            return new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });
        },
        catch: () => new ErrorOfReadingFile(),
    });

// 데이터 URL을 로드해서 이미지 객체를 반환하는 함수
const loadImage = (dataUrl: string) =>
    Effect.tryPromise({
        try: () => {
            const img = new Image();
            return new Promise<HTMLImageElement>((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
                img.src = dataUrl;
            });
        },
        catch: () => new ErrorOfLoadingImage(),
    });

// 이미지 크기를 반환하는 함수
const getImageSize = ({ width, height }: HTMLImageElement): ImageSize => ({
    width,
    height,
});

// 파일에서 이미지 크기를 얻는 프로그램
const createImageSizeProgram = (file: File) =>
    pipe(
        Effect.succeed(file),
        Effect.flatMap(readFile),
        Effect.flatMap(loadImage),
        Effect.map(getImageSize)
    );

// React 컴포넌트
function App() {
    const [count, setCount] = useState(0);
    const [status, setStatus] = useState<FileStatus>({ _tag: "NotSelected" });

    // 파일 선택 핸들러
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setStatus({ _tag: "NotSelected" });
            return;
        }

        const program = pipe(
            createImageSizeProgram(file),
            Effect.map((size) => ({ _tag: "Selected", size } as const)),
            Effect.catchTags({
                ErrorOfReadingFile: () =>
                    Effect.succeed({ _tag: "FileError" } as const),
                ErrorOfLoadingImage: () =>
                    Effect.succeed({ _tag: "NotImage" } as const),
            })
        );

        const result = await Effect.runPromise(program);
        setStatus(result);
    };

    return (
        <div className="App">
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo" alt="Vite logo" />
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div>
                <input type="file" onChange={handleFileChange} />
            </div>
            <div>
                {status._tag === "NotSelected" && "파일이 선택되지 않았습니다."}
                {status._tag === "NotImage" && "이미지 파일이 아닙니다."}
                {status._tag === "FileError" && "파일을 읽는 중에 에러가 발생했습니다."}
                {status._tag === "Selected" &&
                    `이미지 크기: ${status.size.width}x${status.size.height}`}
            </div>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    );
}

export default App;
