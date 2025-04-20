"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, ArrowLeft, Church, Phone, MapPin, Building } from "lucide-react"
import styles from "./register.module.css"
import { VersionBadge } from "@/components/version-badge"
import { createParish } from "@/services/parish-service"

export default function ParishRegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        cnpj: "",
        responsibleName: "",
        address: {
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
        },
    })

    const [formError, setFormError] = useState<string | null>(null)
    const [step, setStep] = useState(1)

    const { signUp, error, loading } = useAuth()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name.includes(".")) {
            const [parent, child] = name.split(".")
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...(typeof prev[parent as keyof typeof prev] === "object" && !Array.isArray(prev[parent as keyof typeof prev]) && prev[parent as keyof typeof prev] !== null
                        ? (prev[parent as keyof typeof prev] as Record<string, unknown>)
                        : {}),
                    [child]: value,
                },
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setFormError("Todos os campos são obrigatórios.")
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError("As senhas não coincidem.")
            return false
        }

        if (formData.password.length < 6) {
            setFormError("A senha deve ter pelo menos 6 caracteres.")
            return false
        }

        setFormError(null)
        return true
    }

    const validateStep2 = () => {
        if (!formData.phone || !formData.cnpj || !formData.responsibleName) {
            setFormError("Todos os campos são obrigatórios.")
            return false
        }

        // Basic CNPJ validation (14 digits)
        if (formData.cnpj.replace(/\D/g, "").length !== 14) {
            setFormError("CNPJ inválido.")
            return false
        }

        setFormError(null)
        return true
    }

    const validateStep3 = () => {
        const { street, neighborhood, city, state } = formData.address

        if (!street || !neighborhood || !city || !state) {
            setFormError("Endereço, bairro, cidade e estado são obrigatórios.")
            return false
        }

        setFormError(null)
        return true
    }

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2)
        } else if (step === 2 && validateStep2()) {
            setStep(3)
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateStep3()) {
            return
        }

        try {
            // Register the parish account
            const success = await signUp(formData.email, formData.password, formData.name, "parish")

            if (success) {
                // Create parish profile
                await createParish(
                    // We would normally get the UID from the auth response
                    // For now, we'll use a placeholder that would be replaced in production
                    "parish_" + Date.now().toString(),
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        cnpj: formData.cnpj,
                        address: formData.address,
                        responsibleName: formData.responsibleName,
                    },
                )

                toast.success("Cadastro realizado com sucesso. Enviamos um e-mail de verificação para o endereço informado.")

                router.push("/auth/verificar-email")
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message || "Erro ao cadastrar paróquia. Tente novamente.")
            } else {
                setFormError("Erro desconhecido ao cadastrar paróquia. Tente novamente.")
            }
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft className={styles.backIcon} />
                    <span>Voltar</span>
                </Link>

                <div className={styles.header}>
                    <Church className={styles.parishIcon} />
                    <h1 className={styles.title}>Cadastrar Paróquia</h1>
                    <p className={styles.subtitle}>Crie uma conta para sua paróquia</p>
                </div>

                <div className={styles.stepIndicator}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>1</div>
                    <div className={styles.stepConnector}></div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>2</div>
                    <div className={styles.stepConnector}></div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>3</div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Informações Básicas</h2>

                            <div className={styles.formGroup}>
                                <Label htmlFor="name" className={styles.label}>
                                    Nome da Paróquia
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Church className={styles.inputIcon} />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Nome da Paróquia"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="email" className={styles.label}>
                                    E-mail
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.inputIcon} />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="paroquia@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="password" className={styles.label}>
                                    Senha
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="confirmPassword" className={styles.label}>
                                    Confirmar senha
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Informações Institucionais</h2>

                            <div className={styles.formGroup}>
                                <Label htmlFor="phone" className={styles.label}>
                                    Telefone
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Phone className={styles.inputIcon} />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="(00) 00000-0000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="cnpj" className={styles.label}>
                                    CNPJ
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <Building className={styles.inputIcon} />
                                    <Input
                                        id="cnpj"
                                        name="cnpj"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="responsibleName" className={styles.label}>
                                    Nome do Responsável
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <User className={styles.inputIcon} />
                                    <Input
                                        id="responsibleName"
                                        name="responsibleName"
                                        placeholder="Nome do responsável"
                                        value={formData.responsibleName}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h2 className={styles.stepTitle}>Endereço</h2>

                            <div className={styles.formGroup}>
                                <Label htmlFor="address.street" className={styles.label}>
                                    Rua/Avenida
                                </Label>
                                <div className={styles.inputWrapper}>
                                    <MapPin className={styles.inputIcon} />
                                    <Input
                                        id="address.street"
                                        name="address.street"
                                        placeholder="Rua/Avenida"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <Label htmlFor="address.number" className={styles.label}>
                                        Número
                                    </Label>
                                    <Input
                                        id="address.number"
                                        name="address.number"
                                        placeholder="Número"
                                        value={formData.address.number}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <Label htmlFor="address.zipCode" className={styles.label}>
                                        CEP
                                    </Label>
                                    <Input
                                        id="address.zipCode"
                                        name="address.zipCode"
                                        placeholder="00000-000"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <Label htmlFor="address.neighborhood" className={styles.label}>
                                    Bairro
                                </Label>
                                <Input
                                    id="address.neighborhood"
                                    name="address.neighborhood"
                                    placeholder="Bairro"
                                    value={formData.address.neighborhood}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <Label htmlFor="address.city" className={styles.label}>
                                        Cidade
                                    </Label>
                                    <Input
                                        id="address.city"
                                        name="address.city"
                                        placeholder="Cidade"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <Label htmlFor="address.state" className={styles.label}>
                                        Estado
                                    </Label>
                                    <Input
                                        id="address.state"
                                        name="address.state"
                                        placeholder="Estado"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {(formError || error) && <p className={styles.error}>{formError || error}</p>}

                    <div className={styles.buttonContainer}>
                        {step > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                className={styles.backButton}
                                disabled={loading}
                            >
                                Voltar
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} className={styles.nextButton} disabled={loading}>
                                Próximo
                            </Button>
                        ) : (
                            <Button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                            </Button>
                        )}
                    </div>
                </form>

                <div className={styles.loginLink}>
                    Já tem uma conta? <Link href="/auth/p/login">Entrar</Link>
                </div>

                <VersionBadge />
            </div>
        </div>
    )
}
