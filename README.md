# AI Smart Security System

זהו פרויקט מקומי למערכת ניתוח סרטונים, שנבנה בהדרגה.

## מה יש כרגע

שלב 1 הושלם:
- נוצר מבנה מסודר לפרויקט
- נוצר צד אתר ב-React
- נוצר צד שרת ב-Node.js
- נוצר חיבור מקומי לגיטהאב
- הוכנו הוראות הפעלה בסיסיות

## מבנה התיקיות

```text
ai-smart-security-system/
├── client/   # האתר
├── server/   # השרת
└── README.md
```

## איך מריצים

פותחים טרמינל בתוך התיקייה של הפרויקט ומריצים:

```bash
npm install --prefix client
npm install --prefix server
```

אחר כך מפעילים את השרת:

```bash
npm run dev --prefix server
```

ובטרמינל נוסף מפעילים את האתר:

```bash
npm run dev --prefix client
```

אחרי ההפעלה:
- האתר ייפתח בכתובת ש-Vite יציג בטרמינל, בדרך כלל `http://localhost:5173`
- השרת ירוץ בדרך כלל על `http://localhost:5001`

## מה עוד לא חובר

עדיין לא חיברנו:
- מסכי העיצוב הסופיים
- הרשמה והתחברות אמיתיים
- מסד נתונים MongoDB
- העלאת סרטון אמיתית
- ניתוח AI

## גיטהאב

המאגר שאליו נחבר את הפרויקט:

[Ai-smart-security-system](https://github.com/yair323bar/Ai-smart-security-system)
