# Backend Reference (FastAPI + FreeRADIUS)

تم إنشاء هذه المجلدات لتحتوي على الأكواد المرجعية للخادم الخلفي باستخدام **Python (FastAPI)** و **SQLAlchemy** للتعامل مع قاعدة بيانات **FreeRADIUS**.

## الملفات المتاحة:

1. `schema.sql`: يحتوي على الجداول الأساسية لـ FreeRADIUS (`radcheck`, `radreply`, `radacct`, `nas`) مضافاً إليها حقل `reseller_id` في كل جدول لضمان العزل التام للموزعين.
2. `database.py`: ملف إعداد الاتصال بقاعدة بيانات MySQL بشكل غير متزامن (Asynchronous) للحصول على أعلى أداء وتجاوب ممكن.
3. `models.py`: جداول قاعدة البيانات ممثلة على شكل كائنات Python (ORM Models).
4. `main.py`: الخادم الأساسي (FastAPI) ويحتوي على نظام مصادقة الدخول (Login) وإصدار توكن (JWT)، بالإضافة إلى نقاط النهاية (API Endpoints) الخاصة بإنشاء وقراءة أجهزة الـ NAS (الميكروتيك) والتي تعمل بنظام العزل، حيث يرى كل موزع أجهزته فقط.
5. `requirements.txt`: المكتبات اللازمة لتشغيل الخادم.

## طريقة التشغيل محلياً:

1. قم بتثبيت المتطلبات:
   ```bash
   pip install -r requirements.txt
   ```
2. تأكد من تعديل `DATABASE_URL` في ملف `database.py` ببيانات قاعدة بيانات MySQL الخاصة بك.
3. قم بتشغيل الخادم عبر Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. يمكنك استعراض وثائق الـ API التفاعلية (Swagger UI) من خلال زيارة: `http://localhost:8000/docs`
