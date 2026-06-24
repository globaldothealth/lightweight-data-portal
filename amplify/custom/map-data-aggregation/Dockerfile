FROM public.ecr.aws/lambda/python:3.11

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --upgrade pip && pip install --only-binary=:all: -r ${LAMBDA_TASK_ROOT}/requirements.txt

COPY index.py ${LAMBDA_TASK_ROOT}/
COPY match_admin0_entries_to_geoBoundary_features.py ${LAMBDA_TASK_ROOT}/
COPY match_admin1_entries_to_geoBoundary_features.py ${LAMBDA_TASK_ROOT}/
COPY prepare_geometry.py ${LAMBDA_TASK_ROOT}/

CMD ["index.handler"]

