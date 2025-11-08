# Zhuen Zhong's Project2
## Using python fastAPI and plain HTML, CSS, Javascript as the technical Stack.

### For Mac:

```bash
bash dev.sh
```

### For Windows:
#### Prerequisites: 
* Install Python 3.10 or later from python.org/downloads

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload

cd ..\frontend
start index.html
pause
```
