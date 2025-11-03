cd backend

python3 -m venv venv #install venv

pip install -r requirements.txt

uvicorn main:app --reload & # play backend

cd ../frontend 

open index.html

wait

