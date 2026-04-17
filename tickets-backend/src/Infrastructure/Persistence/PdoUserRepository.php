<?php

namespace App\Infrastructure\Persistence;

use App\Core\Database;
use App\Domain\User\User;
use App\Domain\User\Boss;
use App\Domain\User\UserRepositoryInterface;
use App\Infrastructure\Mapper\UserMapper;
use PDO;

class PdoUserRepository implements UserRepositoryInterface
{
    private PDO $db;
    private UserMapper $mapper;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->mapper = new UserMapper();
    }

    public function findById(int $id): ?User
    {
        $stmt = $this->db->prepare("SELECT * FROM Users WHERE ID_Users = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToEntity($data) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare("SELECT * FROM Users WHERE Email = :email");
        $stmt->execute(['email' => $email]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToEntity($data) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM Users ORDER BY created_at DESC");
        $users = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = $this->mapper->mapToEntity($data);
        }
        return $users;
    }

    public function save(User $user): User
    {
        if ($user->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Users (Fk_Role, Email, Password) VALUES (:fk_role, :email, :password)"
            );
            $stmt->execute([
                'fk_role' => $user->getFkRole(),
                'email' => $user->getEmail(),
                'password' => $user->getPassword(),
            ]);
            $user->setId((int)$this->db->lastInsertId());
        } else {
            $stmt = $this->db->prepare(
                "UPDATE Users SET Fk_Role = :fk_role, Email = :email WHERE ID_Users = :id"
            );
            $stmt->execute([
                'id' => $user->getId(),
                'fk_role' => $user->getFkRole(),
                'email' => $user->getEmail(),
            ]);
        }
        return $user;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM Users WHERE ID_Users = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function findBossByUserId(int $userId): ?Boss
    {
        $stmt = $this->db->prepare("SELECT * FROM Boss WHERE Fk_User = :fk_user");
        $stmt->execute(['fk_user' => $userId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToBoss($data) : null;
    }

    public function findBossById(int $bossId): ?Boss
    {
        $stmt = $this->db->prepare("SELECT * FROM Boss WHERE ID_Boss = :id");
        $stmt->execute(['id' => $bossId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToBoss($data) : null;
    }

    public function saveBoss(Boss $boss): Boss
    {
        if ($boss->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Boss (Name_Boss, pronoun, Fk_User) VALUES (:name_boss, :pronoun, :fk_user)"
            );
            $stmt->execute([
                'name_boss' => $boss->getNameBoss(),
                'pronoun' => $boss->getPronoun(),
                'fk_user' => $boss->getFkUser(),
            ]);
            $boss->setId((int)$this->db->lastInsertId());
        } else {
            $stmt = $this->db->prepare(
                "UPDATE Boss SET Name_Boss = :name_boss, pronoun = :pronoun WHERE ID_Boss = :id"
            );
            $stmt->execute([
                'id' => $boss->getId(),
                'name_boss' => $boss->getNameBoss(),
                'pronoun' => $boss->getPronoun(),
            ]);
        }
        return $boss;
    }
}
