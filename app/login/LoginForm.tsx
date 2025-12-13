"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FormData {
  email: string;
  password: string;
  password_confirmation: string;
}

const schema = yup.object().shape({
  email: yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().when("$showPassword", {
    is: true,
    then: (schema) => schema.required("Le mot de passe est requis"),
  }),
  password_confirmation: yup.string().when("$showPasswordConfirmation", {
    is: true,
    then: (schema) =>
      schema
        .required("La confirmation est requise")
        .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas"),
  }),
});

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    context: { showPassword, showPasswordConfirmation },
    defaultValues: {
      email: '',
      password: '',
      password_confirmation: ''
    },
  });

  const email = watch("email");

  // Vérification automatique de l'email avec debounce
  useEffect(() => {
    if (!email) return;
    
    const timer = setTimeout(async () => {
      await checkEmail();
    }, 800); // Délai de 800ms après la fin de la frappe

    return () => clearTimeout(timer);
  }, [email]);

  const checkEmail = async () => {
    if (!email) {
      setError("email", { message: "L'email est requis" });
      return;
    }

    // Vérification basique du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("email", { message: "Format d'email invalide" });
      return;
    }

    try {
      const response = await axios.get("/api/check-email", {
        params: { email },
      });

      // Effacer les erreurs existantes
      setError("email", { message: "" });
      
      if (response.data.success) {
        // L'utilisateur existe
        setEmailExists(true);
        
        // Si l'utilisateur a déjà un mot de passe (n'est pas un nouvel utilisateur)
        if (response.data.password !== null) {
          setIsNewUser(false);
          setShowPassword(true);
          setShowPasswordConfirmation(false);
          // Effacer les erreurs d'email
          setError("email", { message: "" });
        } else {
          // Nouvel utilisateur qui doit définir son mot de passe
          setIsNewUser(true);
          setShowPassword(true);
          setShowPasswordConfirmation(true);
          // Effacer les erreurs d'email
          setError("email", { message: "" });
        }
      } else {
        // L'email n'existe pas
        setEmailExists(false);
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        setError("email", { message: "Cet email n'existe pas" });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      setError("email", { message: "Erreur lors de la vérification de l'email" });
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('Soumission du formulaire avec les données:', data);
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        isNewUser: isNewUser && showPasswordConfirmation
      };
      console.log('Envoi de la requête à /api/login avec le payload:', payload);
      
      const response = await axios.post("/api/login", payload);
      console.log('Réponse de l\'API:', response.data);
      
      if (response.data.success) {
        console.log('Création de compte réussie, redirection vers:', response.data.redirect || '/dash');
        // Rediriger vers le tableau de bord après connexion réussie
        router.push(response.data.redirect || "/dash");
      } else {
        console.log('La création de compte a échoué, pas de redirection');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Gestion des erreurs de validation
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          setError(field as keyof FormData, {
            type: "manual",
            message: (messages as string[])[0],
          });
        });
      } else if (error.response?.data?.error) {
        // Gestion des erreurs générales
        setError("email", {
          type: "manual",
          message: error.response.data.error,
        });
      } else {
        // Erreur inattendue
        setError("email", {
          type: "manual",
          message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-light text-center p-5" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div className="brand-logo mb-4">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={180}
          height={60}
          className="mx-auto"
        />
      </div>
      <h4 className="mb-3">Bienvenue sur DAO Project</h4>
      <h6 className="font-weight-light mb-4">Connectez-vous pour accéder à votre espace</h6>
      <form className="pt-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group mb-4">
          <div className="input-group">
            <div className="input-group-prepend bg-transparent">
              <span className="input-group-text bg-transparent border-right-0">
                <i className="mdi mdi-email-outline text-primary"></i>
              </span>
            </div>
     <input
  type="email"
  className={`form-control form-control-lg border-left-0 ${
    emailExists ? "border-primary" : ""
  }`}
  placeholder="Votre adresse email"
  {...register("email")}
  style={{ height: '48px' }}
/>
          </div>
          {errors.email && (
            <div className="text-danger small text-left mt-1">
              {errors.email.message}
            </div>
          )}
        </div>
        {showPassword && (
          <div className="form-group mb-4">
            <div className="input-group">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i className="mdi mdi-lock-outline text-primary"></i>
                </span>
              </div>
              <input
                type="password"
                className={`form-control form-control-lg border-left-0 ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Votre mot de passe"
                {...register("password")}
                style={{ height: '48px' }}
              />
            </div>
            {errors.password && (
              <div className="text-danger small text-left mt-1">
                {errors.password.message}
              </div>
            )}
          </div>
        )}
        {showPasswordConfirmation && (
          <div className="form-group mb-4">
            <div className="input-group">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i className="mdi mdi-lock-check-outline text-primary"></i>
                </span>
              </div>
              <input
                type="password"
                className={`form-control form-control-lg border-left-0 ${
                  errors.password_confirmation ? "is-invalid" : ""
                }`}
                placeholder="Confirmez votre mot de passe"
                {...register("password_confirmation")}
                style={{ height: '48px' }}
              />
            </div>
            {errors.password_confirmation && (
              <div className="text-danger small text-left mt-1">
                {errors.password_confirmation.message}
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <button
            className="btn btn-primary btn-lg btn-block font-weight-medium auth-form-btn"
            type="submit"
            disabled={isLoading}
            style={{
              height: '48px',
              fontSize: '1rem',
              fontWeight: 500,
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Chargement...
              </>
            ) : isNewUser ? (
              "Créer mon compte"
            ) : (
              "Se connecter"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}