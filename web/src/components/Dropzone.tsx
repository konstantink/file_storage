import * as React from "react";


interface DropzoneProps {
    onFileAdded: (a: Array<File>) => void;
}

const Dropzone = ({ onFileAdded }: DropzoneProps) => {
    // const { onFileAdded } = props;
    const [hightlight, setHighlight] = React.useState<boolean>(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const onClick = () => {
        if (inputRef && inputRef.current) {
            inputRef.current.click();
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target && e.target.files) {
            onFileAdded(fileListToArray(e.target.files));
        }
    }

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setHighlight(true);
    }

    const onDragLeave = () => setHighlight(false);
    
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (onFileAdded) {
            const array = fileListToArray(files);
            onFileAdded(array);
        }
        setHighlight(false);
    }

    const fileListToArray = (list: FileList): Array<File> => {
        const array: Array<File> = [];
        for (var i = 0; i < list.length; i++) {
            if(list.item(i)) {
                array.push(list.item(i) as File);
            }
        }
        return array;
    }

    return (
        <div
            className={`dropzone ${hightlight ? "highlight" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div
                className="inputzone"
                onClick={onClick}
            >
                <input 
                    ref={inputRef}
                    type="file"
                    className="fileinput"
                    onChange={onChange}
                />
                <img alt="Upload" src="/upload.svg" className="icon" />
                <span>Upload files</span>
            </div>
        </div>
    )
}

export default Dropzone;