import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { API_ACCESS_KEY, API_BASE_URL } from './src/constants';
import { iUnsplashImages } from './src/types';

const { width, height } = Dimensions.get('window');
const IMAGE_SIZE = 80;
const SPACING = 10;

interface iRenderItem {
  item: iUnsplashImages;
  index: number;
}

const fetchImages = async () => {
  const url = `${API_BASE_URL}search/photos?query=nature&orientation=portrait&per_page=20&client_id=${API_ACCESS_KEY}`;
  const headers = {
    'Accept-Version': 'v1',
  };
  try {
    const json = await fetch(url, {
      headers,
    });
    const { results } = await json.json();
    return results;
  } catch (error) {
    console.log('fetching error', error);
  }
};

const App: React.FunctionComponent = () => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [images, setImages] = useState<[iUnsplashImages] | null>(null);
  useEffect(() => {
    fetchImages().then((p: [iUnsplashImages]) => setImages(p));
  }, []);

  const topRef = useRef<any>();
  const thumbRef = useRef<any>();

  const setActiveIndex = (index: number) => {
    setActiveImageIndex(index);
    topRef?.current.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        anumated: true,
      });
    } else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        anumated: true,
      });
    }
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(e.nativeEvent.contentOffset.x / width);
  };

  const _keyExtractor = (item: iUnsplashImages) => {
    return item.id;
  };

  const renderImageBig = ({ item, index }: iRenderItem) => {
    return (
      <View style={{ width, height }}>
        <Image
          style={[StyleSheet.absoluteFillObject]}
          source={{ uri: item.urls.regular }}
        />
      </View>
    );
  };
  const renderImageSmall = ({ item, index }: iRenderItem) => {
    return (
      <TouchableOpacity onPress={() => setActiveIndex(index)}>
        <Image
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: 12,
            marginRight: SPACING,
            borderWidth: 2,
            borderColor: activeImageIndex === index ? 'white' : 'transparent',
          }}
          source={{ uri: item.urls.regular }}
        />
      </TouchableOpacity>
    );
  };
  if (!images)
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  return (
    <View style={styles.container}>
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={_keyExtractor}
        renderItem={renderImageBig}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        keyExtractor={_keyExtractor}
        renderItem={renderImageSmall}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        style={{ position: 'absolute', bottom: IMAGE_SIZE }}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
