// Polyfills must be first — before any package that references browser globals
import './src/polyfills';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);