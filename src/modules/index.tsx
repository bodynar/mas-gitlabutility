import { createRoot } from 'react-dom/client';
import { HashRouter } from "react-router-dom";

import { Provider } from "react-redux";
import store from "@app/store/main";

import App from "./app";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bulma/bulma.sass";
import "bulma-checkradio/dist/css/bulma-checkradio.sass";
import "src/shared/styles.scss";

const container = document.getElementById("root");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
    <Provider store={store}>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>
);
