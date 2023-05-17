import React, { useState } from "react";
import SafeExample from "./SafeExample";
import SimpleExample from "./SimpleExample";

const App = () => {
  const [currentRoute, setRoute] = useState("home");

  switch (currentRoute) {
    case "safe":
      return <SafeExample goBack={() => setRoute("home")} />;
    case "simple":
      return <SimpleExample goBack={() => setRoute("home")} />;
    default:
      return (
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold">
                Bitski + Account Abstraction
              </h1>
              <p className="py-6">
                Provident cupiditate voluptatem et in. Quaerat fugiat ut
                assumenda excepturi exercitationem quasi. In deleniti eaque aut
                repudiandae et a id nisi.
              </p>
              <button
                className="btn mr-4 bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => setRoute("safe")}
              >
                Safe Example
              </button>
              <button
                className="btn bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => setRoute("simple")}
              >
                Simple Account Example
              </button>
            </div>
          </div>
        </div>
      );
  }
};

export default App;
