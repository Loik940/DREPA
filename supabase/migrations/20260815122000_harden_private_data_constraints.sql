-- Cette migration reproduit côté PostgreSQL les bornes principales déjà appliquées par les formulaires mobiles.
-- Les contraintes NOT VALID protègent les nouvelles écritures sans bloquer le déploiement sur une donnée historique à corriger.

alter table public.profiles
  add constraint profiles_country_length check (country is null or char_length(country) <= 80) not valid,
  add constraint profiles_city_length check (city is null or char_length(city) <= 80) not valid,
  add constraint profiles_drepanocytosis_type_length check (drepanocytosis_type is null or char_length(drepanocytosis_type) <= 80) not valid,
  add constraint profiles_blood_group_length check (blood_group is null or char_length(blood_group) <= 20) not valid,
  add constraint profiles_allergies_length check (allergies is null or char_length(allergies) <= 500) not valid,
  add constraint profiles_care_center_length check (care_center is null or char_length(care_center) <= 160) not valid,
  add constraint profiles_doctor_name_length check (doctor_name is null or char_length(doctor_name) <= 160) not valid,
  add constraint profiles_doctor_phone_length check (doctor_phone is null or char_length(doctor_phone) <= 40) not valid,
  add constraint profiles_date_of_birth_not_future check (date_of_birth is null or date_of_birth <= created_at::date) not valid;

alter table public.emergency_contacts
  add constraint emergency_contacts_phone_length check (char_length(phone) between 1 and 40) not valid,
  add constraint emergency_contacts_whatsapp_phone_length check (whatsapp_phone is null or char_length(whatsapp_phone) <= 40) not valid,
  add constraint emergency_contacts_relationship_length check (relationship is null or char_length(relationship) <= 80) not valid;

alter table public.health_logs
  add constraint health_logs_temperature_range check (temperature is null or temperature between 25 and 45) not valid,
  add constraint health_logs_symptoms_cardinality check (symptoms is null or cardinality(symptoms) <= 12) not valid,
  add constraint health_logs_triggers_cardinality check (possible_triggers is null or cardinality(possible_triggers) <= 12) not valid;
