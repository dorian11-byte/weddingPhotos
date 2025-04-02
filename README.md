# Wedding Memories Photo Upload App

A mobile-first Next.js application that allows wedding guests to upload their photos directly to a designated Google Drive folder. The app features a sleek, responsive design with an intuitive photo selection modal, preview and removal options, and a loader to indicate upload progress. Each route is tailored for specific wedding dates, ensuring a unique experience for every event.

## Features

- **Mobile-First & Responsive Design:**  
  Optimized for mobile devices with a fluid, responsive layout.

- **Photo Upload & Management:**  
  - Select up to 10 photos at once.
  - Preview selected photos in a responsive grid.
  - Remove individual photos before uploading.
  - Option to add more photos if less than 10 are selected.

- **Fast & Efficient Uploads:**  
  Files are uploaded in binary using FormData, reducing data overhead compared to base64 conversion.

- **Google Drive API Integration:**  
  Securely upload photos to a dedicated Google Drive folder using a Service Account.

- **Intuitive Navigation:**  
  Seamless routing and history management, allowing users to return to their specific event pages.

## Technologies

- **Next.js** – React framework for server-side rendering and static site generation.
- **Tailwind CSS** – Utility-first CSS framework for rapid UI development.
- **Google Drive API** – For file storage and management.
- **Google APIs Node.js Client** – To handle authentication and file uploads.
- **Environment Variables** – For secure configuration (e.g., Google Service Account credentials).

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/wedding-photo-app.git
   cd wedding-photo-app


2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Set up environment variables:**    
   Create a `.env.local` file in the root directory and add your Google Service Account credentials and other necessary configurations.

   ```plaintext
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_key
   GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
   ```
4. **Run the development server:**

   ```bash
   npm run dev
   ```
5. **Open your browser:**
   Navigate to `http://localhost:3000` to view the app.


## Usage
1. **Select Photos:**  
   Click on the upload button to open the photo selection modal. Choose up to 10 photos from your device.

2. **Preview & Remove:**
   Preview the selected photos in a grid layout. Click on any photo to remove it from the selection.
   If you want to add more photos, click the upload button again.

3. **Upload Photos:**
   Click the upload button to start the upload process. A loader will indicate the progress of the upload.

4. **Confirmation:**
   Once the upload is complete, a confirmation message will be displayed.

5. **Navigate to Event Page:**
   After uploading, you can navigate back to the event page or select another date.
   
7. **Error Handling:**
    If an error occurs during the upload process, an error message will be displayed. Ensure you have a stable internet connection and try again.

## Contributing
Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.
## License  
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
## Acknowledgments
- Thanks to the Next.js and Tailwind CSS communities for their amazing resources and documentation.
- Special thanks to the Google Drive API documentation for providing clear guidelines on file uploads.
- Inspiration from various open-source projects and wedding photo upload applications.

    