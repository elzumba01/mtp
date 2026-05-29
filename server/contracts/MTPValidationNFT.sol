// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MTP Validation NFT
 * -------------------
 * Contrato ERC-721 para emitir un NFT por cada documento validado dentro
 * del ecosistema MTP Platform. Diseñado para desplegarse en ETTIOS BLOCKCHAIN
 * (EVM-compatible, Chain ID 2237).
 *
 * Cada NFT representa un dictamen profesional verificable, con su metadata
 * (tipo de documento, riesgo IA, validaciones, reputación del propietario)
 * apuntada por tokenURI a un endpoint JSON estilo ERC-721 estándar.
 *
 * Diseño:
 *   - El "owner" del contrato es el deployer.
 *   - Solo addresses con rol MINTER pueden invocar safeMint().
 *   - El owner puede otorgar/revocar el rol MINTER (típicamente el wallet
 *     que usa la API del servidor MTP).
 *
 * Dependencias: ninguna externa. Implementación mínima compatible con
 * OpenSea / Etherscan / cualquier marketplace ERC-721 estándar.
 */

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        external returns (bytes4);
}

contract MTPValidationNFT is IERC721Metadata {
    string  private _name   = "MTP Validation";
    string  private _symbol = "MTPV";

    address public owner;
    mapping(address => bool) public minters;

    uint256 private _nextTokenId;
    uint256 private _totalSupply;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string)  private _tokenURIs;

    event OwnerChanged(address indexed previous, address indexed current);
    event MinterSet(address indexed minter, bool enabled);

    modifier onlyOwner()  { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyMinter() { require(minters[msg.sender] || msg.sender == owner, "Not minter"); _; }

    constructor() {
        owner = msg.sender;
        minters[msg.sender] = true;
        emit OwnerChanged(address(0), msg.sender);
        emit MinterSet(msg.sender, true);
    }

    // ---- Administración ----
    function setMinter(address m, bool enabled) external onlyOwner {
        minters[m] = enabled;
        emit MinterSet(m, enabled);
    }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    // ---- Mint ----
    /// @notice Mintea un nuevo NFT al destinatario `to` con metadata en `uri`.
    /// @return tokenId el ID del nuevo NFT.
    function safeMint(address to, string memory uri) external onlyMinter returns (uint256) {
        require(to != address(0), "zero to");
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId]   = to;
        _balances[to]     += 1;
        _tokenURIs[tokenId] = uri;
        _totalSupply      += 1;
        emit Transfer(address(0), to, tokenId);
        require(_checkOnERC721Received(address(0), to, tokenId, ""), "non ERC721Receiver");
        return tokenId;
    }

    // ---- Metadata ----
    function name() external view returns (string memory) { return _name; }
    function symbol() external view returns (string memory) { return _symbol; }
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "no token");
        return _tokenURIs[tokenId];
    }
    function totalSupply() external view returns (uint256) { return _totalSupply; }

    // ---- ERC721 ----
    function balanceOf(address o) external view returns (uint256) {
        require(o != address(0), "zero addr");
        return _balances[o];
    }
    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _owners[tokenId];
        require(o != address(0), "no token");
        return o;
    }
    function approve(address to, uint256 tokenId) external {
        address o = ownerOf(tokenId);
        require(to != o, "approve self");
        require(msg.sender == o || isApprovedForAll(o, msg.sender), "not auth");
        _tokenApprovals[tokenId] = to;
        emit Approval(o, to, tokenId);
    }
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "no token");
        return _tokenApprovals[tokenId];
    }
    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    function isApprovedForAll(address o, address operator) public view returns (bool) {
        return _operatorApprovals[o][operator];
    }
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isAuthorized(msg.sender, tokenId), "not auth");
        _transfer(from, to, tokenId);
    }
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "non ERC721Receiver");
    }

    function _isAuthorized(address spender, uint256 tokenId) internal view returns (bool) {
        address o = ownerOf(tokenId);
        return spender == o || getApproved(tokenId) == spender || isApprovedForAll(o, spender);
    }
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "wrong from");
        require(to != address(0), "zero to");
        _tokenApprovals[tokenId] = address(0);
        _balances[from] -= 1;
        _balances[to]   += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data)
        private returns (bool)
    {
        if (to.code.length == 0) return true;
        try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch { return false; }
    }

    // ---- ERC165 ----
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC165).interfaceId
            || interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC721Metadata).interfaceId;
    }
}
