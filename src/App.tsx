import { AppProvider } from './core/providers/AppProvider';
import { AppRouter } from './core/routing/AppRouter';
import { DocumentTitle } from './core/routing/DocumentTitle';
import { ScrollToTopButton } from './shared/components/ScrollToTopButton';
import './styles/global.css';
import './styles/app.css';

function App() {
  return (
    <AppProvider>
      <DocumentTitle />
      <AppRouter />
      <ScrollToTopButton />
    </AppProvider>
  )
}

export default App
