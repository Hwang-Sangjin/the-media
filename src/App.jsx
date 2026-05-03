import { useSceneStore, SCENES } from "./store/sceneStore";
import Loading from "./scenes/Loading/Loading";
import Title from "./scenes/Title/Title";
import Scene01_Interstellar from "./scenes/Scene01_Interstellar/Scene01_Interstellar";
import Scene02_GrandBudapest from "./scenes/Scene02_GrandBudapest/Scene02_GrandBudapest";
import Scene03_Matrix from "./scenes/Scene03_Matrix/Scene03_Matrix";
import EndingCredits from "./scenes/EndingCredits/EndingCredits";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import Transition from "./components/Transition/Transition";
import DotNavigation from "./components/Navigation/DotNavigation";
import Header from "./components/Navigation/Header";
import { useEffect } from "react"; // 추가

function App() {
  const currentScene = useSceneStore((state) => state.currentScene);
  useKeyboardNavigation(); // 추가

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScene]);

  const renderScene = () => {
    switch (currentScene) {
      case SCENES.LOADING:
        return <Loading />;
      case SCENES.TITLE:
        return <Title />;
      case SCENES.SCENE_01:
        return <Scene01_Interstellar />;
      case SCENES.SCENE_02:
        return <Scene02_GrandBudapest />;
      case SCENES.SCENE_03:
        return <Scene03_Matrix />;
      case SCENES.ENDING:
        return <EndingCredits />;
      default:
        return <Loading />;
    }
  };

  return (
    <div className="relative w-screen h-screen ">
      {renderScene()}
      <Header />
      <DotNavigation />
      <Transition />
    </div>
  );
}

export default App;
