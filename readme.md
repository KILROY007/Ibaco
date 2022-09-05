## Setup
1. Install Node using command 'brew install node'
2. Install React Native CLI using command 'npm install -g react-native-cli'
3. Install Android Studio and Install Xcode
4. Checkout the Source Code
5. Install dependencies : npm install

## Debug on iOS
1. First Terminal window: npm start
2. Second Terminal window: npm run ios

## Debug on Android
1. First Terminal window: npm start
2. Second Terminal window: npm run android

## Run directly from xcode or build ipa or submit to app store

1. run following command to build js bundle and to copy assets

react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios

2. Edit schema and select Release
3. Run/Archive like normal ios App

## Run directly from Android Studio, create signed apk

1. run following command to build js bundle and to copy assets

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

2. Open android studio and switch to release build Varient

3. Run/Create Signed apk like normal android App