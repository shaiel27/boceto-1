# Instructions to Test Connection

## 1. Start Backend
```bash
cd c:\xampp\htdocs\boceto-1\tickets-backend
php -S 0.0.0.0:8000 -t public
```

## 2. Start Frontend  
```bash
cd c:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-frontend
npm start
```

## 3. Test Connection
- Open browser: http://192.168.1.5:3000
- Login with: admin@alcaldia.gob / password123
- Check browser console for connection errors

## Configuration Applied:
- ✅ Frontend API_BASE_URL: http://192.168.1.5:8000
- ✅ Backend CORS allowed: http://192.168.1.5:3000

## Expected Results:
- No CORS errors
- Successful authentication
- Tickets data loads correctly
