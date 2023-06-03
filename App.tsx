import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, useColorScheme  } from 'react-native';
import NavigationBar from 'react-native-navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    backgroundColor: '#27374D',
    height: 60,
  },
  tableContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cellText: {
    color: 'black', // Default text color
  },

  cellTextDarkMode: {
    color: 'black'// Text color for dark mode
  },
  input: {
    width: '100%',
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  headerRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#27374D',
  },
  indexCell: {
    backgroundColor: '#27374D',
    borderColor: '#ffffff',
  },
});


const titleConfig = {
  title: 'Excel Sheets App',
  style: {
    fontSize: 25,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: 'white',
  },
};

function CNavbar() {
  const colorScheme = useColorScheme();
  const [inputValues, setInputValues] = useState(Array(50).fill(''));

  useEffect(() => {
    retrieveData();
  }, []);

  const handleInputChange = (index, value) => {
    const updatedValues = [...inputValues];
    updatedValues[index] = value;
    setInputValues(updatedValues);
    saveData(updatedValues);
  };

  const getRowLabel = (index) => {
    return (index + 1).toString();
  };

  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  const retrieveData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('inputValues');
      if (savedData) {
        const deserializedData = JSON.parse(savedData, (key, value) => {
          if (key === 'handler') {
            return eval('(' + value + ')');
          }
          return value;
        });
        setInputValues(deserializedData);
        console.log('Data retrieved successfully');
      }
    } catch (error) {
      console.log('Error retrieving data:', error);
    }
  };

  const saveData = async (data) => {
    try {
      const serializedData = JSON.stringify(data, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      });
      await AsyncStorage.setItem('inputValues', serializedData);
      console.log('Data saved successfully');
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };
  

  
  
const rightButtonConfig = {
  title: 'Download',
  tintColor: 'white',
  style: {
    backgroundColor: '#0EA293',
    borderRadius: 5,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textStyle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  handler: async () => {
    try {
      // Create a 2D array to hold the data
      const data = [];
      for (let i = 0; i < 10; i++) {
        const rowData = [];
        for (let j = 0; j < 5; j++) {
          const index = i * 5 + j;
          rowData.push(inputValues[index] || ''); // If input value is empty, use an empty string
        }
        data.push(rowData);
      }
      // Convert data to Excel format
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate file path
      // Generate file path
      const downloadsPath = RNFS.DownloadDirectoryPath;
      const dateTime = new Date().toISOString().replace(/[-:.]/g, ''); // Get current date and time as a string without separators
      const filePath = `${downloadsPath}/data_${dateTime}.xlsx`;


      // Convert workbook to binary data
      const excelData = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      // Save file to device storage
      await RNFS.writeFile(filePath, excelData, 'base64');

      console.log('File saved successfully:', filePath);
      Alert.alert('Success', 'File downloaded successfully, Check Your downloads.', [
        { text: 'OK' }
      ]);
    } catch (error) {
      console.log('Error saving file:', error);
      Alert.alert('Error', 'File download failed.');
    }
  },
};
  return (
    <View style={styles.container}>
      <NavigationBar
        style={styles.navbar}
        title={titleConfig}
        rightButton={rightButtonConfig}
      />
      <ScrollView>
        <View style={styles.tableContainer}>
          <View style={styles.headerRowContainer}>
            <View style={[styles.headerCell, styles.indexCell]}>
              <Text style={styles.headerText}>Index</Text>
            </View>
            {[...Array(5)].map((_, colIndex) => (
              <View key={colIndex} style={styles.headerCell}>
                <Text style={styles.headerText}>
                  {getColumnLabel(colIndex)}
                </Text>
              </View>
            ))}
          </View>
          {[...Array(10)].map((_, rowIndex) => (
            <View key={rowIndex} style={styles.rowContainer}>
              <View style={[styles.cell, styles.indexCell]}>
                <Text style={styles.headerText}>{getRowLabel(rowIndex)}</Text>
              </View>
              {[...Array(5)].map((_, colIndex) => {
                const index = rowIndex * 5 + colIndex;
                return (
                  <View key={colIndex} style={styles.cell}>
                    <TextInput
                      style={[
                        styles.input,
                        colorScheme === 'dark' && styles.cellTextDarkMode, // Apply dark mode text color style conditionally
                      ]}
                      value={inputValues[index]}
                      onChangeText={(text) => handleInputChange(index, text)}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const App = () => {
  return (
    <View style={styles.container}>
      <CNavbar />
    </View>
  );
};

export default App;
