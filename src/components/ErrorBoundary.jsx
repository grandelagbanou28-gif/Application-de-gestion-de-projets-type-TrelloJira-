import { Component } from "react";
import { store } from "../app/store";
import fr from "../i18n/fr";
import en from "../i18n/en";
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  t(key) {
    const lang = store.getState().language.lang;
    const keys = key.split(".");
    let value = { fr: fr, en: en }[lang];
    for (const k of keys) {
      if (value) value = value[k];
    }
    return typeof value === "string" ? value : key;
  }
  render() {
    if (this.state.error) {
      return <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">           <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">             <span className="text-2xl">!</span>           </div>           <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">{this.t('error.title')}</h2>           <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 text-center max-w-md">             {this.state.error?.message || this.t('error.description')}           </p>           <button onClick={() => {
          this.setState({
            error: null
          });
          window.location.reload();
        }} className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700">             {this.t('error.reload')}           </button>         </div>;
    }
    return this.props.children;
  }
}