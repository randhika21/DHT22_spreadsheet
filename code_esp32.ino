#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>

#define DHTPIN 15        // Pin where the DHT22 is connected
#define DHTTYPE DHT22   // DHT 22 (AM2302)

// Replace with your network credentials
const char* ssid = "tester";
const char* password = "katasandi";

// Replace with your Web App URL
const char* serverName = "https://script.google.com/macros/s/AKfycbyQWJdExXiwdsJXh9Uuk1_-V03hlBU9IMdpI7-bHVBdKXiU--5HOKa9lm8X2rxgFvGXCA/exec";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  delay(500); // Delay between measurements

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Send data to Google Sheets
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverName) + "?temperature=" + String(temperature) + "&humidity=" + String(humidity);
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on HTTP request: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
