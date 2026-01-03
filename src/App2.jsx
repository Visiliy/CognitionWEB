import "./App2.css"
import FilesSpace from "./components/JS/FilesSpace";
import Heads from "./components/JS/Heads";
import WorkSpaseChat from "./components/JS/WorkSpaseChat";

const App2 = () => {
    return (
        <>
            <Heads />
            <div className="space">
                <FilesSpace />
                <WorkSpaseChat />
            </div>
            
        </>
    );
}

export default App2;